// QLICKER
// Author: Hayden Pfeiffer <hayden.pfeiffer@queensu.ca>, modified by Malcolm Anderson <malcolminyo@gmail.com> for institutions
//
// ManageInstitutions.jsx: Component for admin institution management

import React, { Component } from 'react'

import { RestrictDomainForm } from './RestrictDomainForm'
import Select from 'react-select'
import 'react-select/dist/react-select.css'

import { ROLES } from '../configs'

export class ManageInstitutions extends Component {

  constructor(props) {
    super(props)
    console.log(props)
    this.state = {
      allInsts: props.allInsts,
      searchInst:''
    }

    this.setValue = this.setValue.bind(this)
    this.handleSubmitNewInstitution = this.handleSubmitNewInstitution.bind(this)
    // this.handleSubmit = this.handleSubmit.bind(this)
    // this.setFilterUserSearchString = this.setFilterUserSearchString.bind(this)
    // // see https://github.com/facebook/react/issues/1360
    // this.setFilterUserSearchString = _.debounce(this.setFilterUserSearchString,400)
  }

  componentDidMount () {
    let courseNames = []
    for (let cid in this.props.courseNames ){
      if( this.props.courseNames.hasOwnProperty(cid) )
      courseNames.push({ value: cid, label: this.props.courseNames[cid] })
    }
    this.setState({ courseNames: courseNames })
  }

  setValue (e) {
    let stateEdits = {}
    stateEdits[e.target.dataset.name] = e.target.value

    console.log(stateEdits)
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
    console.log("Institutions: " + typeof institutions + " <" + institutions + ">")
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
      <div className='row'>
        <h1>{institutions.length} institutions</h1>
        <form className='ql-admin-login-box' onSubmit={this.handleSubmitNewInstitution}>
            <input className='form-control' type='text' data-name='newInstName' onChange={this.setValue} placeholder='Institution name' value={this.state.newInstName} />
            <input type='submit' id='submitButton' className='btn btn-primary btn-block' value='Add an institution' />
        </form>
        <div className = 'ql-admin-user-table-container'>
          <div className = 'ql-admin-user-table'>
            <table className='table table-bordered'>
              <tbody>
                <tr>
                  <th>Name</th>
                </tr>
                {
                  institutions.map((u) => {
                    // let courseList = ''
                    // if (u.profile.courses && this.props) {
                    //   u.profile.courses.forEach(function (cId) {
                    //     courseList += this.props.courseNames[cId] ? this.props.courseNames[cId] + ' ' : ''
                    //   }.bind(this))
                    // }
                    return (<tr key={u._id}>
                      <td>
                        {u.name}
                      </td>
                    </tr>)
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
}
