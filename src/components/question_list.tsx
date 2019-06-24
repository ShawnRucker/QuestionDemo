import Config from '../config.json';
import React, { Component, FormEvent }  from 'react';
import ReactPaginate from 'react-paginate';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert, { AlertProps } from 'react-bootstrap/Alert';
import questionMatchData from '../models/questionMatchData';
import Col from 'react-bootstrap/Col';

enum postTypes {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  COPY = 'COPY',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  LINK = 'LINK',
  UNLINK = 'UNLINK',
  PURGE = 'PURGE',
  LOCK = 'LOCK',
  UNLOCK = 'UNLOCK',
  PROPFIND = 'PROPFIND',
  VIEW = 'VIEW'
}

interface alertType {
  alertTite: string;
  alertMessage: string;
  alertType:
   | 'primary'
   | 'secondary'
   | 'success'
   | 'danger'
   | 'warning'
   | 'info'
   | 'dark'
   | 'light'
}

// Setup State
interface IState {
  currentPage : number,
  pageSize: number,
  pageCount: number,
  questions: questionMatchData[];
  alertShow: boolean;
  alert: alertType;
  duplicatesModalShown: boolean;
  duplicatesModalActiveQuestion: questionMatchData;
  duplicatesMatchingOn: duplicatesMatchBasedOn;
  duplicatesQuestions: questionMatchData[];
}

enum duplicatesMatchBasedOn {
  ExactMatch = 100,
  Match95 = 95,
  Match90 = 90,
  Match85 = 85,
  Match80 = 80,
  Match75 = 75,
  Match70 = 70,
  Match65 = 65,
  Match60 = 60,
  Match55 = 55,
  Match50 = 50,
  Match45 = 45,
  Match40 = 40
}

export class QuestionList extends Component<{}, IState> {

  constructor(props:any, ...state:any) {
    super(props, state);

    this.state = {
      currentPage: 1,
      pageSize: 10,
      pageCount: 0,
      questions: [],
      alertShow: false,
      alert: {} as alertType,
      duplicatesModalShown: false,
      duplicatesModalActiveQuestion: {} as questionMatchData,
      duplicatesMatchingOn: duplicatesMatchBasedOn.ExactMatch,
      duplicatesQuestions: []
    }

    // This could also be done in the individual elements
    this.handleDuplicateModalShow = this.handleDuplicateModalShow.bind(this);
    this.handleDuplicateModalClose = this.handleDuplicateModalClose.bind(this);
    this.handleShowAlert = this.handleShowAlert.bind(this);
    this.handleHideAlert = this.handleHideAlert.bind(this);
    this.handlePercentageMatchChange = this.handlePercentageMatchChange.bind(this);

  }

  public componentDidMount() {
    this.loadQuestionsFromServer();
  }

  // Utility function to manage getting items from the server.
  // TODO : Place in Utility Class
  // TODO : Log Errors / Make errors more descrptive of the actual failure
  fetchFromServer(url:string, postType: postTypes) 
  {
     return fetch(url,{
      method: postType,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
     })
     .then((response) => { 
      if(response.status != 200){
        console.error(response.statusText);
        this.handleShowAlert(
          {
            alertTite:'What we have here is a failure to communicate!',
            alertMessage: response.statusText,
            alertType: 'danger'
          });         
        return;
      }
      return response.json()
      }).catch((error)=>
      {
        console.error(error);
        this.handleShowAlert(
          {
            alertTite:'What we have here is a failure to communicate!',
            alertMessage: 'Problem occurred trying to access to API Server.',
            alertType: 'danger'
          }); 
      })
     .then((responseData)=>{
            return responseData;
      }).catch((error)=>{
        console.error(error);
        this.handleShowAlert(
          {
            alertTite:'What we have here is a failure to communicate!',
            alertMessage: 'Problem occurred trying to access to API Server.',
            alertType: 'danger'
          }); 
      });
  }

  /************************************************************************************
   Loads the questions from the API based on:
    Page     : Integer whole number from page 1 to the MAX number of pages
    PageSize : Integer whole number dictating how many items to return for each page 
   *************************************************************************************/
   loadQuestionsFromServer() {
      this.fetchFromServer(
        `${Config.baseURL}/questions?page=${this.state.currentPage}&pagesize=${this.state.pageSize}`,
        postTypes.GET
      ).then(response=>{
        // Verify we have data to be set into the state
        if(response !== undefined) {
          this.setState({ 
            pageCount: response.pagingInformation.totalPages,
            questions: response.questions as questionMatchData[] 
          });
        }
      })
  }

  // ----------------------------------------------------------------------------------------------
  // Duplicates 
  // ----------------------------------------------------------------------------------------------
      handleDuplicateModalClose() {
        this.setState({ duplicatesModalShown: false });
      }

      handleDuplicateModalShow(activeQuestion:questionMatchData) {
        // Load the details for the selected item
        this.setState(
          { 
            duplicatesModalShown: true,
            duplicatesModalActiveQuestion: activeQuestion,
            duplicatesMatchingOn: duplicatesMatchBasedOn.ExactMatch // Start with Exact Match
          });
        this.loadQuestionMatchesFromServer(activeQuestion, duplicatesMatchBasedOn.ExactMatch);
      }

      handlePercentageMatchChange(percentageToMatch: duplicatesMatchBasedOn) {
        this.setState({duplicatesMatchingOn: percentageToMatch});
        this.loadQuestionMatchesFromServer(this.state.duplicatesModalActiveQuestion, percentageToMatch);
      }

      loadQuestionMatchesFromServer(activeQuestion:questionMatchData, percentageToMatch:duplicatesMatchBasedOn) {
        this.fetchFromServer(
          `${Config.baseURL}/matching_questions?questiontomatch=${activeQuestion.questionText}&percentagetomatch=${percentageToMatch}`, postTypes.GET
        ).then(response=>{
          // Verify we have data to load into the state
          if(response !== undefined) {
            this.setState({ 
              duplicatesQuestions: response as questionMatchData[] 
            })
          } else {
            // This is loading data into a modal we need to hide the modal so the error is visible
            this.handleDuplicateModalClose();
          };
        })
      }
    
      onPageChange(pageClick:any){
        let selected = pageClick.selected;
        this.setState({ currentPage : selected + 1}, () => {
          this.loadQuestionsFromServer();
        });
      };

  // ----------------------------------------------------------------------------------------------
  // Alerts 
  // ----------------------------------------------------------------------------------------------
      handleShowAlert(alertInfo : alertType) {
        this.setState(
          { 
            alertShow: true,
            alert: alertInfo
          }
        )
      }

      handleHideAlert() {
        this.setState(
          {
            // Clear out the alert so a false alert cannot be shown for some reason.
            alertShow: false,
            alert: {} as alertType
          })
      }

  // ----------------------------------------------------------------------------------------------
  // RENDER METHOD 
  // ----------------------------------------------------------------------------------------------
  render() {
    return(
    <div>
    <Alert show={this.state.alertShow} variant={this.state.alert.alertType} onClose={this.handleHideAlert} dismissible>
      <Alert.Heading>{this.state.alert.alertTite}</Alert.Heading>
      <p>{this.state.alert.alertMessage}</p>
    </Alert>
    <Modal show={this.state.duplicatesModalShown} onHide={this.handleDuplicateModalClose}
      size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Duplicates Matching The Selected Question 
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <Form>
          <Form.Label className='duplicateQuestions_QuestionTitle'>{this.state.duplicatesModalActiveQuestion.questionText}</Form.Label>
          <hr></hr>
          <Form.Row>
            <Col>
              <Form.Label className='duplicateQuestions_QuestionText'>I would like to match the question based on </Form.Label>
            </Col>
            <Col>
              <Form.Control as="select" onChange={e=>this.handlePercentageMatchChange((e.currentTarget as any).value)}>
                <option value={duplicatesMatchBasedOn.ExactMatch}>100% Exact Match</option>
                <option value={duplicatesMatchBasedOn.Match95}>95% Match</option>
                <option value={duplicatesMatchBasedOn.Match90}>90% Match</option>
                <option value={duplicatesMatchBasedOn.Match85}>85% Match</option>
                <option value={duplicatesMatchBasedOn.Match80}>80% Match</option>
                <option value={duplicatesMatchBasedOn.Match75}>75% Match</option>
                <option value={duplicatesMatchBasedOn.Match70}>70% Match</option>
                <option value={duplicatesMatchBasedOn.Match65}>65% Match</option>
                <option value={duplicatesMatchBasedOn.Match65}>60% Match</option>
                <option value={duplicatesMatchBasedOn.Match55}>55% Match</option>
                <option value={duplicatesMatchBasedOn.Match50}>50% Match</option>
              </Form.Control>
            </Col>
          </Form.Row>
          </Form>
          <hr></hr>
          <div><b>Returned :&nbsp;</b>{this.state.duplicatesQuestions.length}&nbsp;possible matche(s)</div>
          <Table className="duplicateQuestions_DataGrid" striped bordered hover responsive>
          <thead>
            <tr>
              <th>Category</th>
              <th>Question</th>
              <th>Percentage Match</th>
            </tr>
          </thead>
          <tbody>
            {/* Lets do the sort client side this time.  Just because we can :) */}
            {this.state.duplicatesQuestions.sort((a,b):number => {
              if(a.questionGroupName < b.questionGroupName) return -1;
              if(a.questionGroupName > b.questionGroupName) return 1;
              return 0;
            })
              .map((duplicatesQuestions) => (
              <tr key={duplicatesQuestions.id.toString()}>
                <td>{duplicatesQuestions.questionGroupName}</td>
                <td>{duplicatesQuestions.questionText}</td>
                <td>{new Intl.NumberFormat('en-us', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(parseFloat(duplicatesQuestions.percentageMatch))}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={()=>this.handleDuplicateModalClose()}>Close</Button>
      </Modal.Footer>
    </Modal>

    <div className="questionViewContainer">
      <div>

      </div>
      <Table className="dataGrid" striped bordered hover responsive>
        <thead>
          <tr>
            <th>Category</th>
            <th>Question</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          {this.state.questions.map((question) =>(
            <tr key={question.id.toString()}>
              <td>{question.questiongroup.name}</td>
              <td>{question.questionText}</td>
              <td>
              <Button variant="info" onClick={() => this.handleShowAlert(
                {
                  alertTite:'Non Active Feature',
                  alertMessage: 'The "Edit" feature is not supported in this demo',
                  alertType: 'info'
                })}>Edit</Button>&nbsp;&nbsp;
              <Button variant="info" onClick={() => this.handleDuplicateModalShow(question)}>Duplicate(s)</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <ReactPaginate
        previousLabel={'previous'}
        nextLabel={'next'}
        breakLabel={'...'}
        breakClassName={'box'}
        pageCount={this.state.pageCount}
        marginPagesDisplayed={1}
        pageRangeDisplayed={10}
        onPageChange={this.onPageChange.bind(this)}
        containerClassName={'pagination'}
        activeClassName={'active'}
      />
    </div>
    </div>
    );
  }
  
}
