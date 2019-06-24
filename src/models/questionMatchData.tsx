import questionGroupData from './questionGroupData';

export default interface questionMatchData {
  id: bigint;
  questionText: string;
  createdAt: Date;
  updatedAt: Date;
  questiongroup: questionGroupData;
  percentageMatch: string;
  questionGroupName: string;
}
