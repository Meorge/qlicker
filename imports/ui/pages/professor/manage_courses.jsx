// QLICKER
// Author: Enoch T <me@enocht.am>
//
// manage_courses.jsx: all courses (active & inactive) page

import React, { Component } from 'react'
import Select from 'react-select'
import 'react-select/dist/react-select.css'

// import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data'

import { CourseListItem } from '../../CourseListItem'
import { CreateCourseModal } from '../../modals/CreateCourseModal'

import { Courses } from '../../../api/courses.js'

class _ManageCourses extends Component {

  constructor (props) {
    super(props)

    this.state = { 
      creatingCourse: false
     }

    this.doneCreatingCourse = this.doneCreatingCourse.bind(this)
    this.promptCreateCourse = this.promptCreateCourse.bind(this)
    this.deleteCourse = this.deleteCourse.bind(this)
    this.setCourseActive = this.setCourseActive.bind(this)

    this.collectCourseInformation = this.collectCourseInformation.bind(this)
  }

  componentDidMount () {
    Meteor.setTimeout(this.collectCourseInformation, 500)
    // this.collectCourseInformation()
  }

  deleteCourse (courseId) {
    if (confirm('Are you sure?')) {
      Meteor.call('courses.delete', courseId, (error) => {
        if (error) return alertify.error('Error deleting course')
      })
      Meteor.setTimeout(this.collectCourseInformation, 500)
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
    Meteor.setTimeout(this.collectCourseInformation, 500)
  }

  collectCourseInformation () {
    // Get a list of all of the departments
    depts = []
    sems = []

    for (index = 0; index < this.props.courses.length; index++) {
      if (!depts.includes(this.props.courses[index].deptCode)) {
        var b = this.props.courses[index].deptCode.toUpperCase()
        depts.push( { value: b, label: b } )
      }

      if (!sems.includes(this.props.courses[index].semester)) {
        var b = this.props.courses[index].semester.toUpperCase()
        sems.push( { value: b, label: b } )
      }
    }

    this.setState({ deptCodes: depts })
    this.setState({ sems: sems })
  }

  renderCourseList (cList) {
    // Search filtering
    if ( this.state.filterClassSearchString ) {
      cList = _(cList).filter(function (crs) {
        var searched = this.state.filterClassSearchString.toLowerCase()
        return crs.name.toLowerCase().includes(searched)
        || crs.deptCode.toLowerCase().includes(searched)
        || crs.courseNumber.toLowerCase().includes(searched)
        || crs.section.toLowerCase().includes(searched)
        || crs.semester.toLowerCase().includes(searched)
        || (crs.name + " " + crs.deptCode + " " + crs.courseNumber + " " + crs.section + " " + crs.semester).toLowerCase().includes(searched)
      }.bind(this))
    }

    if ( this.state.searchDept  && this.state.searchDept.length > 0 ){
      cList = cList.filter( function (crs) {
        var lcArray = _(this.state.searchDept).pluck('value').map(v => v.toLowerCase());
        return lcArray.includes(crs.deptCode.toLowerCase())
      }.bind(this))
    }

    if ( this.state.searchSem  && this.state.searchSem.length > 0 ){
      cList = cList.filter( function (crs) {
        var lcArray = _(this.state.searchSem).pluck('value').map(v => v.toLowerCase());
        return lcArray.includes(crs.semester.toLowerCase())
      }.bind(this))
    }

    return cList.map( (course) => {
      
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


  setFilterDeptSearchString (val) {
    this.setState( {filterDeptSearchString: val} )
  }

  render () {
    const setSearchCourse = (e) => {
      this.setState({ searchCourse: e.target.value })// need this to update the input box
      this.setFilterClassSearchString(e.target.value)
    }

    const setSearchDept = (val) => {
      this.setState({ searchDept: val })// need this to update the input box
    }

    const setSearchSem = (val) => {
      this.setState({ searchSem: val })// need this to update the input box
    }

    return (
      <div className='container ql-professor-page'>
        <h1>Courses</h1>
        <button className='btn btn-primary' onClick={this.promptCreateCourse}>Create Course</button>

        <br />
        <div className = "container">
          <div className = "row">
            <div className = 'ql-search-table-container'>
              <div className = 'ql-search'>
                <input type='text' placeholder='Search...' onChange = {setSearchCourse} value={this.state.searchCourse} />
                  <div className='select-container'>
                    <Select
                      name='search-dept'
                      placeholder='Department'
                      multi
                      value={this.state.searchDept}
                      options={this.state.deptCodes}
                      onChange={setSearchDept}
                      />
                  </div>
                  <div className='select-container'>
                    <Select
                      name='search-sem'
                      placeholder='Semester'
                      multi
                      value={this.state.searchSem}
                      options={this.state.sems}
                      onChange={setSearchSem}
                      />
                  </div>
              </div>
            </div>

          </div>
        </div>

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
