import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {QuestionList} from './components/question_list';
import ListGroup from 'react-bootstrap/ListGroup';

import img_contacts from './images/Contacts.png';

const App: React.FC = () => {
  return (
    <div className="App">
      <div className=".col-md-12 App-header">
        <div className="float-right row">
          <div className="customerStatus">Customer@Customer.com</div>
          <div className="logOut">Log Out</div>
        </div>
      </div>
      <div className="row">
      <div className="col-md-2">
        <ListGroup variant="flush">
          <ListGroup.Item><b>Navigation</b></ListGroup.Item>
          <ListGroup.Item className="notInThisDemo">Coverage</ListGroup.Item>
          <ListGroup.Item className="notInThisDemo">Claims</ListGroup.Item>
          <ListGroup.Item className="notInThisDemo">Scheduling</ListGroup.Item>
          <ListGroup.Item className="notInThisDemo">Benchmarking</ListGroup.Item>
          <ListGroup.Item className="notInThisDemo">Billing</ListGroup.Item>
        </ListGroup>
        <img className="notInThisDemo" width="230px" src={img_contacts}></img>
      </div>
      <div className="col-md-10 Work-area">
        <QuestionList></QuestionList>
      </div>
      </div>
    </div>
  );
}

export default App;
