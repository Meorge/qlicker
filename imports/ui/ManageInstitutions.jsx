// QLICKER
// Author: Hayden Pfeiffer <hayden.pfeiffer@queensu.ca>, modified by Malcolm Anderson <malcolminyo@gmail.com> for institutions
//
// ManageInstitutions.jsx: Component for admin institution management

import React, { Component } from 'react'

// import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data'

import { RestrictDomainForm } from './RestrictDomainForm'
import Select from 'react-select'
import 'react-select/dist/react-select.css'

import { ROLES } from '../configs'

import { Institutions } from '../api/institutions.js'
import { InstitutionListItem } from './InstitutionListItem'


/*
THE SITUATION (4 Jan 2019):

When an Institution is created, everything is fine for a moment, and then it seemingly gets deleted the next time the admin dashboard's
createContainer() is run

*/
export class _ManageInstitutions extends Component {

  constructor(props) {
    super(props)
    this.state = {
      searchInst:''
    }

    this.setValue = this.setValue.bind(this)
    this.handleSubmitNewInstitution = this.handleSubmitNewInstitution.bind(this)
    this.deleteInstitution = this.deleteInstitution.bind(this)
    // this.handleSubmit = this.handleSubmit.bind(this)
    // this.setFilterUserSearchString = this.setFilterUserSearchString.bind(this)
    // // see https://github.com/facebook/react/issues/1360
    // this.setFilterUserSearchString = _.debounce(this.setFilterUserSearchString,400)
  }

  componentDidMount () {

    // let allInsts = []
    // for (let cid in this.props.allInsts ){
    //   if( this.props.allInsts.hasOwnProperty(cid) )
    //   allInsts.push({ value: cid, label: this.props.allInsts[cid] })
    // }
    // this.setState({ allInsts: allInsts })
  }

  deleteInstitution (instId) {
    if (confirm('Are you sure?')) {
      Meteor.call('institutions.delete', instId, (error) => {
        if (error) return alertify.error('Error deleting institution')
        else return alertify.success('Institution deleted')
      })
      // Meteor.setTimeout(this.collectCourseInformation, 500)
    }
  }

  setValue (e) {
    let stateEdits = {}
    stateEdits[e.target.dataset.name] = e.target.value
    this.setState(stateEdits)
  }

  handleSubmitNewInstitution (e) {
    e.preventDefault()

    const newInst = {
        name: this.state.newInstName,
        instructors: [],
        createdAt: new Date(),
        requireVerified: false
    }

    Meteor.call('institutions.insert', newInst, (e, data) => {
    if (e) alertify.error(e.reason)
    else alertify.success('Institution created')
    this.setState({ newInstName: '' })
    })
  }

  setFilterUserSearchString (val) {
    this.setState( {filterUserSearchString:val} )
  }

  render() {
    if (this.props.loading ) return <div className='ql-subs-loading'>Loading</div>

    const setSupportEmail = (e) => { this.setState({ supportEmail: e.target.value }) }
    const setSearchCourses = (val) => { this.setState({ searchCourses: val }) }
    const setSearchUser = (e) => {
      this.setState({ searchUser: e.target.value })// need this to update the input box
      this.setFilterUserSearchString(e.target.value)// this debounces the filtering (https://github.com/facebook/react/issues/1360)
    }
    const setSearchRoles = (val) => { this.setState({ searchRoles: val }) }

    // Apply search criteria, if present
    let institutions = this.props.allInsts
    // if( this.state.filterUserSearchString ){
    //   users = _(users).filter( function (user) {
    //     return user.profile.lastname.toLowerCase().includes(this.state.filterUserSearchString.toLowerCase())
    //      || user.profile.firstname.toLowerCase().includes(this.state.filterUserSearchString.toLowerCase())
    //      || user.emails[0].address.toLowerCase().includes(this.state.filterUserSearchString.toLowerCase())
    //   }.bind(this))
    // }
    // if( this.state.searchCourses  && this.state.searchCourses.length > 0 ){
    //   users = _(users).filter( function (user) {
    //     return (_.intersection( _(this.state.searchCourses).pluck('value'), user.profile.courses)).length > 0
    //   }.bind(this))
    // }
    // if( this.state.searchRoles  && this.state.searchRoles.length > 0 ){
    //   users = _(users).filter( function (user) {
    //     return (_.intersection( _(this.state.searchRoles).pluck('value'), user.profile.roles)).length > 0
    //   }.bind(this))
    // }

    return(
      <div className='container'>
        <h1>{institutions.length} institutions</h1>
        <form className='ql-admin-login-box' onSubmit={this.handleSubmitNewInstitution}>
            <input className='form-control' type='text' data-name='newInstName' onChange={this.setValue} placeholder='Institution name' value={this.state.newInstName} />
            <input type='submit' id='submitButton' className='btn btn-primary btn-block' value='Add an institution' />
        </form>
        <div className='ql-courselist'>
          {
            institutions.map((u) => {
              return(
                <InstitutionListItem
                  key={u._id}
                  inst={u}
                  click={() => { Router.go('institution', { instId: u._id }) }}
                  controls={[
                    { label: 'Delete', click: () => this.deleteInstitution(u._id) }
                  ]} 
                  showUserStatus={false} />
            )})
          }
      </div>
      </div>
    )
  }
}

export const ManageInstitutions = createContainer(() => {
  const handle = Meteor.subscribe('institutions')

  return {
    allInsts: Institutions.find({ }).fetch(),
    loading: !handle.ready()
  }
}, _ManageInstitutions)