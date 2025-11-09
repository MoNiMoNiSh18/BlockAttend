// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Attendance {
    address public admin;
    event AttendanceMarked(address indexed teacher, string subject, string className, address student, uint256 date, bool present);

    constructor() {
        admin = msg.sender;
    }

    struct Record {
        address teacher;
        string subject;
        string className;
        address student;
        uint256 date;
        bool present;
    }

    Record[] public records;

    function markAttendance(string memory subject, string memory className, address student, uint256 date, bool present) public {
        records.push(Record(msg.sender, subject, className, student, date, present));
        emit AttendanceMarked(msg.sender, subject, className, student, date, present);
    }

    function getRecordsCount() public view returns (uint256) {
        return records.length;
    }
}
