// QLICKER
// Author: Enoch T <me@enocht.am>
//
// manage_courses.jsx: all courses (active & inactive) page

import React, { Component } from 'react'
// import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data'

import { CourseListItem } from '../../CourseListItem'
import { CreateCourseModal } from '../../modals/CreateCourseModal'

import { Courses } from '../../../api/courses.js'

class _ManageCourses extends Component {

  constructor (props) {
    super(props)

    this.state = { creatingCourse: false }

    this.doneCreatingCourse = this.doneCreatingCourse.bind(this)
    this.promptCreateCourse = this.promptCreateCourse.bind(this)
    this.deleteCourse = this.deleteCourse.bind(this)
    this.setCourseActive = this.setCourseActive.bind(this)
  }

  deleteCourse (courseId) {
    if (confirm('Are you sure?')) {
      Meteor.call('courses.delete', courseId, (error) => {
        if (error) return alertify.error('Error deleting course')
      })
    }
  }

  setCourseActive (courseId, active) {
    if (confirm('Are you sure?')) {
      Meteor.call('courses.setActive', courseId, active, (error) => {
        if (error) return alertify.error('Error archiving course')
      })
    }
  }


  promptCreateCourse (e) {
    this.setState({ creatingCourse: true })
  }

  doneCreatingCourse (e) {
    this.setState({ creatingCourse: false })
    Meteor.setTimeout(this.forceUpdate, 500)
  }

  renderCourseList (cList) {
    
    // Search filtering
    if ( this.state.filterClassSearchString ) {
      cList = _(cList).filter(function (crs) {
        return crs.name.toLowerCase().includes(this.state.filterClassSearchString.toLowerCase())
        || crs.deptCode.toLowerCase().includes(this.state.filterClassSearchString.toLowerCase())
        || crs.courseNumber.toLowerCase().includes(this.state.filterClassSearchString.toLowerCase())
        || crs.section.toLowerCase().includes(this.state.filterClassSearchString.toLowerCase())
        || crs.semester.toLowerCase().includes(this.state.filterClassSearchString.toLowerCase())
      }.bind(this))
    }
    return cList.map( (course) => {
      console.log(Object.keys(course))
      controls = []
      if (course.inactive) {
        controls.push( { label: 'Make active', click: () => this.setCourseActive(course._id, true) } )
        controls.push( { label: 'Delete', click: () => this.deleteCourse(course._id) } )
      } else {
        controls.push( { label: 'Make inactive', click: () => this.setCourseActive(course._id, false) } )
      }
      
      return(
        <CourseListItem
          key={course._id}
          course={course}
          click={() => { Router.go('course', { courseId: course._id }) }}
          controls={controls} />
      )
    })
  }


  setFilterClassSearchString (val) {
    this.setState( {filterClassSearchString: val} )
  }

  render () {
    const setSearchCourse = (e) => {
      console.log(e.target.value)
      this.setState({ searchCourse: e.target.value })// need this to update the input box
      this.setFilterClassSearchString(e.target.value)
    }

    return (
      <div className='container ql-professor-page'>
        <h1>Courses</h1>
        <button className='btn btn-primary' onClick={this.promptCreateCourse}>Create Course</button>

        <br />
        <input type='text' placeholder='Search...' onChange = {setSearchCourse} value={this.state.searchCourse} />
        <div className='ql-courselist'>
          { this.renderCourseList(this.props.courses.filter((c) => !c.inactive)) }
        </div>
        <br /><br />
        <h2>Inactive Courses</h2>
        <div className='ql-courselist'>
          { this.renderCourseList(this.props.courses.filter((c) => c.inactive)) }
        </div>

        { this.state.creatingCourse ? <CreateCourseModal done={this.doneCreatingCourse} /> : '' }
      </div>)
  }
}

export const ManageCourses = createContainer(() => {
  const handle = Meteor.subscribe('courses')

  return {
    courses: Courses.find({ instructors: Meteor.userId() }).fetch(),
    loading: !handle.ready()
  }
}, _ManageCourses)
