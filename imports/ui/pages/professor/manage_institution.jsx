/* global confirm  */
// QLICKER
// Author: Enoch T <me@enocht.am>, modified by Malcolm Anderson <malcolminyo@gmail.com> for institutions
//
// manage_institution.jsx: page for managing a specific institution

import React, { Component } from 'react'
// import ReactDOM from 'react-dom'
import _ from 'underscore'
import { createContainer } from 'meteor/react-meteor-data'

import { Courses } from '../../../api/courses'
import { Grades } from '../../../api/grades'
import { Sessions } from '../../../api/sessions'
import { Institutions } from '../../../api/institutions'
import { CreateSessionModal } from '../../modals/CreateSessionModal'
import { CourseOptionsModal } from '../../modals/CourseOptionsModal'
import { PickCourseModal } from '../../modals/PickCourseModal'
import { AddTAModal } from '../../modals/AddTAModal'
import { AddStudentModal } from '../../modals/AddStudentModal'
import { AddProfessorModal } from '../../modals/AddProfessorModal'
import { ProfileViewModal } from '../../modals/ProfileViewModal'

import { ROLES } from '../../../configs'

import { SessionListItem } from '../../SessionListItem'
import { StudentListItem } from '../../StudentListItem'
import { ProfessorListItem } from '../../ProfessorListItem'

class _ManageInstitution extends Component {

  constructor (props) {
    super(props)

    this.state = {
      creatingSession: false,
      copySessionModal: false,
      profileViewModal: false,
      addTAModal: false,
      addProfModal: false,
      courseOptionsModal:false,
      sessionToCopy: null,
      expandedInteractiveSessionlist: false,
      expandedQuizlist: false,
      searchString:'',
      //requireApprovedPublicQuestions: this.props.course.allowStudentQuestions
    }
    this.toggleCopySessionModal = this.toggleCopySessionModal.bind(this)

    this.removeStudent = this.removeStudent.bind(this)
    this.toggleVerification = this.toggleVerification.bind(this)
    this.toggleProfileViewModal = this.toggleProfileViewModal.bind(this)
    this.renderLocalAdminList = this.renderLocalAdminList.bind(this)
  //  this.toggleRequireApprovedPublicQuestions = this.toggleRequireApprovedPublicQuestions.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    // const course = nextProps.course
    // this.setState({ requireVerified: course.requireVerified, allowStudentQuestions: course.allowStudentQuestions })
  }

  toggleCopySessionModal (sessionId = null) {
    this.setState({ copySessionModal: !this.state.copySessionModal, sessionToCopy: sessionId })
  }

  toggleProfileViewModal (userToView = null) {
    this.setState({ profileViewModal: !this.state.profileViewModal, userToView: userToView })
  }

  removeStudent (studentUserId) {
    if (confirm('Are you sure?')) {
      Meteor.call('courses.removeStudent',
        this.props.course._id,
        studentUserId,
        (error) => {
          if (error) return alertify.error('Error: couldn\'t remove student')
          alertify.success('Removed student')
        })
    }
  }

  removeLocalAdmin (userId) {
    if (confirm('Are you sure?')) {
      Meteor.call('institutions.removeLocalAdmin',
        this.props.institution._id,
        userId,
        (error) => {
          if (error) return alertify.error('Error: couldn\'t remove institutional administrator')
          alertify.success('Removed institutional administrator')
        })
    }
  }

  removeTA (TAUserId) {
    if (confirm('Are you sure?')) {
      Meteor.call('courses.removeTA',
        this.props.course._id,
        TAUserId,
        (error) => {
          if (error) return alertify.error('Error: couldn\'t remove TA')
          alertify.success('Removed TA')
        })
    }
  }

  toggleVerification () {
    Meteor.call('courses.setVerification', this.props.course._id, !this.props.course.requireVerified, (error) => {
      if (error) return alertify.error('Error: could not set course property')
      alertify.success('Email verification' + (this.props.course.requireVerified ? '' : ' not') + ' required')
    })
    this.setState({ requireVerified: !this.state.requireVerified })
  }

  renderLocalAdminList () {
    let uid = Meteor.userId()
    let isProfOrAdmin = Meteor.user().hasGreaterRole('professor')
    let localAdmins = this.props.institution.localAdmins || []
    let profs = this.props.institution.instructors || []

    console.log("Local admins: " + localAdmins)

    // // Filter using the search string, if appropriate
    // if (this.state.searchString){
    //   students = _(students).filter( function (id) {
    //     if (!this.props.students[id]) return false
    //     return this.props.students[id].profile.lastname.toLowerCase().includes(this.state.searchString.toLowerCase())
    //      || this.props.students[id].profile.firstname.toLowerCase().includes(this.state.searchString.toLowerCase())
    //      || this.props.students[id].emails[0].address.toLowerCase().includes(this.state.searchString.toLowerCase())
    //   }.bind(this))

    //   TAs = _(TAs).filter( function (id) {
    //     if (!this.props.TAs[id]) return false
    //     return this.props.TAs[id].profile.lastname.toLowerCase().includes(this.state.searchString.toLowerCase())
    //      || this.props.TAs[id].profile.firstname.toLowerCase().includes(this.state.searchString.toLowerCase())
    //      || this.props.TAs[id].emails[0].address.toLowerCase().includes(this.state.searchString.toLowerCase())
    //   }.bind(this))
    // }


    // then sort alphabetically
    // localAdmins = _(localAdmins).sortBy(function (id) {
    //   return (this.props.institution.localAdmins[id]
    //     ? this.props.students[id].profile.lastname.toLowerCase()
    //                : '0')
    // }.bind(this))

    return (<div>
      {
        localAdmins.map((sId) => {
          console.log("Looking for user with id " + sId)
          const prof = Meteor.users.findOne(sId)
          if (!prof) {
            console.log("this user is null")
            return (
              <div>
                User with ID {sId} not found
              </div>
            )
          }
          let controls = [{ label: 'Remove', click: () => this.removeLocalAdmin(sId) }]
          return (
          
          <ProfessorListItem
            key={sId}
            prof={prof}
            click={() => this.toggleProfileViewModal(stu)}
            controls={isProfOrAdmin ? controls : ''} />)
        })
      }
    </div>)
  }

  render () {
    if (this.props.loading ) return <div className='ql-subs-loading'>Loading</div>
    //console.log(this.state)
    const toggleAddProf = () => { this.setState({ addProfModal: !this.state.addProfModal }) }

    // const nStudents = (this.props.course && this.props.course.students) ? this.props.course.students.length : 0
    // const nSessions = this.props.sessions ?  _(this.props.sessions).where({quiz:false}).length : 0
    // const nQuizzes = this.props.sessions ? _(this.props.sessions).where({quiz:true}).length : 0

    console.log("manage_institution.jsx - inst id is <" + this.props.institution._id + ">")

    return (
        <div className='container ql-manage-course'>
            <h2><span className='ql-course-code'>{this.props.institution.name}</span></h2>
            <br />
            <div className='row'>
                <div className='col-md-4'>
                    <div className='ql-card'>
                        <div className='ql-header-bar'>Institutional Admins</div>
                        <div className='ql-card-content'>
                            {
                                this.renderLocalAdminList()
                            }
                        </div>
                        <div className='btn btn-default' onClick={toggleAddProf}>Add Institutional Admin
                        { this.state.addProfModal ? <AddProfessorModal instId={this.props.institution._id} done={toggleAddProf} /> : '' }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    /*return (
      <div className='container ql-manage-course'>
        <h2><span className='ql-course-code'>COURSE CODE</span> - COURSE NAME</h2>
        <br />
        <div className='row'>
          <div className='col-md-4'>

            <div className='ql-card'>
              <div className='ql-header-bar'>
                <h4>Course Details</h4>
              </div>
              <div className='ql-card-content'>
                <div className='btn-group btn-group-justified details-button-group'>
                  <div className='btn btn-default' onClick={manageGroups}> Manage Groups </div>
                </div>
                {Meteor.user().hasGreaterRole(ROLES.prof) ? <div>
                  <div className='btn-group btn-group-justified details-button-group'>
                    <div className='btn btn-default' onClick={toggleAddTA}>Add Instructor/TA
                      { this.state.addTAModal ? <AddTAModal courseId={this.props.course._id} courseName={this.props.course.courseCode()} done={toggleAddTA} /> : '' }
                    </div>
                    <div className='btn btn-default' onClick={toggleAddStudent}>Add Student
                      { this.state.addStudentModal ? <AddStudentModal courseId={this.props.course._id} courseName={this.props.course.courseCode()} done={toggleAddStudent} /> : '' }
                    </div>
                  </div>
                  <div className='btn-group btn-group-justified details-button-group'>
                    <div className='btn btn-default' onClick={toggleCourseOptions}>
                      Course options
                    </div>
                  </div>
                </div> : ''
                }
                <div className='ql-course-details'>
                  <span className='ql-course-code'>COURSE CODE </span> -
                  <span className='ql-course-semester'> SEMESTER</span>
                  <br />
                  Enrollment Code: <span className='ql-enrollment-code'>COURSE CODE ACUTALLY</span>
                  &nbsp;&nbsp;<a href='#' onClick={this.generateNewCourseCode}>new</a>
                </div>
              </div>
            </div>

            <div className='ql-card hidden-xs'>
              <div className='ql-header-bar' >
                <h4>{nStudents} student{nStudents > 1 ? 's' : ''}</h4>
              </div>
              <div>
                <div className='ql-course-classlist-container'>
                  <div className='ql-course-classlist-search'>
                    <input type='text' placeholder='Search by name or email' onChange={_.throttle(updateSearchString, 200)} value={this.state.searchString}/>
                  </div>
                  <div className='ql-course-classlist'>
                    { this.renderClassList() }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='col-md-8'>
            <div className='btn-group session-button-group'>
              <button className='btn btn-primary' onClick={toggleCreatingSession}>Create new interactive session/quiz</button>
            </div>
            { nSessions > 0 ?
              <div>
                <h3>Interactive sessions ({nSessions} session{nSessions > 1 ? 's' : '' })</h3>
                <div className='ql-session-list'>
                  { this.renderInteractiveSessionList() }
                </div>
              </div>
              :<div><h3> No interactive sessions to display</h3> </div>
            }
            { nQuizzes > 0 ?
              <div>
                <h3>Quizzes ({nQuizzes} quiz{nQuizzes > 1 ? 'zes' : '' })</h3>
                <div className='ql-session-list'>
                  { this.renderQuizList() }
                </div>
              </div>
              : <div><h3> No quizzes to display</h3> </div>
            }

          </div>
        </div>
      </div>)*/
  }

}

export const ManageInstitution = createContainer((props) => {
  const handle = Meteor.subscribe('institutions.single', props.instId)// &&
    //Meteor.subscribe('courses.forInstitution', props.instId)

  const institution = Institutions.findOne({ _id: props.instId })

  console.log("This institution ID is " + institution._id)

  return {
    institution: institution,
    loading: !handle.ready()
  }
}, _ManageInstitution)
