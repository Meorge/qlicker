/* global confirm  */
// QLICKER
// Author: Enoch T <me@enocht.am>
//
// manage_course.jsx: page for managing a specific course

import React, { Component } from 'react'
// import ReactDOM from 'react-dom'
import _ from 'underscore'
import { createContainer } from 'meteor/react-meteor-data'

import { Courses } from '../../../api/courses'

import { CreateGroupCategoryModal } from '../../modals/CreateGroupCategoryModal'
import Select from 'react-select'

import { ROLES } from '../../../configs'


class _ManageCourseGroups extends Component {

  constructor (props) {
    super(props)

    this.state = {
      category:null,
      group:null,
      changingGroupeName:false,
      newGroupName:'',
    }

    this.setCategory = this.setCategory.bind(this)
    this.setGroup = this.setGroup.bind(this)
    this.setNewGroupName = this.setNewGroupName.bind(this)
    this.toggleChanginGroupName = this.toggleChanginGroupName.bind(this)
    this.changeGroupName = this.changeGroupName.bind(this)
  }

  componentWillReceiveProps (nextProps){
    if (this.state.category && this.state.group){
      // handle the case where the group or category was modified, so update the state
      const newCategory = _(nextProps.course.groupCategories).findWhere({ categoryNumber:this.state.category.categoryNumber })
      const newGroup = _(newCategory.groups).findWhere({ groupNumber:this.state.group.groupNumber })
      this.setState({ category:newCategory, group:newGroup })
    }
  }

  setCategory (option) {
    if(option){
      const category = _(this.props.course.groupCategories).findWhere({ categoryNumber:option.value })
      this.setState({ category:category, group:null })
    } else {
      this.setState({ category:null, group:null })
    }
  }

  setGroup (option) {
    if(option && this.state.category){
      const group = _(this.state.category.groups).findWhere({ groupNumber:option.value })
      if(group) this.setState({ group:group })
    } else {
      this.setState({ group:null })
    }
  }

  setNewGroupName (e) {
    this.setState({ newGroupName:e.target.value })
  }

  toggleChanginGroupName () {
    this.setState({ changingGroupeName:!this.state.changingGroupeName })
  }

  changeGroupName () {
    if( this.state.category && this.state.group && this.state.newGroupName){
      Meteor.call('courses.changeGroupName', this.props.courseId, this.state.category.
                                             categoryNumber, this.state.group.groupNumber, this.state.newGroupName,
                                            (error) => {
        if (error) return alertify.error(error.err)
        alertify.success('Group name changed')
      })
      this.setState({ changingGroupeName:false, newGroupName:'' })
    }

  }

  render () {
    if (this.props.loading) return <div className='ql-subs-loading'>Loading</div>
    let categoryOptions = []
    const groupCategories = this.props.course.groupCategories ? this.props.course.groupCategories : []
    const toggleCreateCategory = () => { this.setState({ categoryModal: !this.state.categoryModal }) }

    groupCategories.forEach( (category) => {
      categoryOptions.push({ value:category.categoryNumber,
                             label:category.categoryName })
    })
    let groupOptions = []
    if (this.state.category){
      this.state.category.groups.forEach( (g) =>{
        groupOptions.push({ value:g.groupNumber,
                            label:g.groupName })
      })
    }
    let studentsInGroup = this.state.group? this.state.group.students : []

    return(
      <div className='container ql-manage-course-groups'>
        <div className='row'>
          <div className='col-md-4'>
            <div className='ql-card'>
              <div className='ql-header-bar'>
                <h4>Categories</h4>
              </div>
              <div className='ql-card-content'>
                <div className='btn-group btn-group-justified'>
                  <div className='btn btn-default' onClick={toggleCreateCategory}> Create a new Category </div>
                  { this.state.categoryModal ? <CreateGroupCategoryModal courseId={this.props.course._id} done={toggleCreateCategory} /> : '' }
                </div>
                { categoryOptions.length
                  ? <div className='ql-manage-course-groups-select'>
                      <Select
                        name='category-input'
                        placeholder='Type to search for a category'
                        value={this.state.category ? this.state.category.categoryNumber : null}
                        options={categoryOptions}
                        onChange={this.setCategory}
                      />
                    </div>
                  : ''
                }
                { groupOptions.length
                  ? <div className='ql-manage-course-groups-select'>
                      <Select
                          name='category-input'
                          placeholder='Type to search for a group'
                          value={this.state.group ? this.state.group.groupNumber : null}
                          options={groupOptions}
                          onChange={this.setGroup}
                      />
                   </div>
                  : ''
                }
              </div>
            </div>
          </div>

          <div className='col-md-4'>
            <div className='ql-card'>
              <div className='ql-header-bar'>
                <h4>Group</h4>
              </div>
              <div className='ql-card-content ql-manage-course-groups-group'>
                {this.state.group
                  ? <div className='ql-manage-course-groups-group-info'>
                      Group name:&nbsp;&nbsp; {this.state.changingGroupeName
                        ? <div>
                            <input type='text' onChange={this.setNewGroupName} size="8" placeholder={this.state.group.groupName}></input>
                            &nbsp;&nbsp;
                            <a onClick={this.changeGroupName}>save</a>
                            &nbsp;&nbsp;
                            <a onClick={this.toggleChanginGroupName}>cancel</a>
                          </div>
                        : <div> {this.state.group.groupName}&nbsp;&nbsp; <a onClick={this.toggleChanginGroupName}>change</a> </div>}
                    </div>
                  : <div> {this.state.category ? 'Select a group in category': 'Select a category of group'}</div>
                }
              </div>
            </div>
          </div>

          <div className='col-md-4'>
            <div className='ql-card'>
              <div className='ql-header-bar'>
                <h4>Students</h4>
              </div>
              <div className='ql-card-content'>
              </div>
            </div>
          </div>


        </div>
      </div>
    )

  }

}


export const ManageCourseGroups = createContainer((props) => {
  const handle = Meteor.subscribe('courses.single', props.courseId) &&
    Meteor.subscribe('users.studentsInCourse', props.courseId)

  const course = Courses.findOne({ _id: props.courseId })
  const studentIds = course.students || []
  const students = Meteor.users.find({ _id: { $in: studentIds } }).fetch()

  return {
    course: course,
    students: _(students).indexBy('_id'),
    loading: !handle.ready()
  }

}, _ManageCourseGroups)
