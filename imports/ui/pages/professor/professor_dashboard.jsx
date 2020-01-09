// QLICKER
// Author: Enoch T <me@enocht.am>
//
// professor_dashboard.jsx: professor overview page

import React, { Component } from 'react'
// import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data'
import _ from 'underscore'

import { StudentCourseComponent } from '../../StudentCourseComponent'
import { CreateCourseModal } from '../../modals/CreateCourseModal'

import { Courses } from '../../../api/courses'
import { Sessions } from '../../../api/sessions'
import { Institutions } from '../../../api/institutions'
import { InstitutionListItem } from '../../InstitutionListItem'

class _ProfessorDashboard extends Component {

  constructor (props) {
    super(props)

    this.state = { creatingCourse: false, edits: {} }

    this.doneCreatingCourse = this.doneCreatingCourse.bind(this)
    this.promptCreateCourse = this.promptCreateCourse.bind(this)
  }

  promptCreateCourse (e) {
    this.setState({ creatingCourse: true })
  }

  doneCreatingCourse (e) {
    this.setState({ creatingCourse: false })
  }

  render () {
    return (
      <div className='container ql-professor-page'>
        <h2>Active Courses</h2>
        <div className='btn-group'>
          <button className='btn btn-primary' onClick={this.promptCreateCourse}>Create Course</button>
          <button className='btn btn-primary' onClick={() => Router.go('courses')}>Manage All Courses</button>
        </div>
        <div className='ql-courselist'>
          {this.props.courses.map((course) => (<StudentCourseComponent key={course._id} course={course} sessionRoute='session.edit' />))}
        </div>
        <br /><br />
        <h2>My Institutions</h2>
        <div className='ql-courselist'>
          {this.props.localAdminInsts.map((inst) => inst ? (
          <InstitutionListItem key={inst._id} inst={inst} click={() => { Router.go('institution', { instId: inst._id }) }} controls={[]} showUserStatus={true} />) : '')}

          {this.props.profInsts.map((inst) => inst ? (
          <InstitutionListItem key={inst._id} inst={inst} click={() => { Router.go('institution', { instId: inst._id }) }} controls={[]} showUserStatus={true} />) : '')}
        </div>


        {/* modals */}
        { this.state.creatingCourse ? <CreateCourseModal done={this.doneCreatingCourse} insts={this.props.localAdminInsts.concat(this.props.profInsts.concat())}/> : '' }
      </div>)
  }

}

export const ProfessorDashboard = createContainer(() => {
  const handle = Meteor.subscribe('courses') && Meteor.subscribe('institutions')//&& Meteor.subscribe('sessions')

  const courses = Courses.find({ instructors: Meteor.userId(), inactive: { $in: [null, false] } }).fetch()

  // There's a property for users called 'profile.profForInstitutions' that is a list of the institutions
  // for which they're a professor. Let's first get this array...
  const user = Meteor.users.findOne({_id: Meteor.userId()})

  const localAdminInsts = user.localAdminForInstitutions()//.concat(user.profForInstitutions())
  const profInsts = user.profForInstitutions()

  console.log("Institutions I've got: " + Object.keys(localAdminInsts))
  localAdminInsts.map((inst) => console.log("Institution ID=<" + inst._id + "> Name=<" + inst.name + ">"))
  /*const sessions = Sessions.find({
    courseId: { $in: _(courses).pluck('_id') },
    $or: [{ status: 'visible' }, { status: 'running' }]
  }).fetch()*/
  return {
    courses: courses,
    localAdminInsts: localAdminInsts,
    profInsts: profInsts,
    //sessions: sessions,
    loading: !handle.ready()
  }
}, _ProfessorDashboard)
