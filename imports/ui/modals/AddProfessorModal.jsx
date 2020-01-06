// QLICKER
// Author: Enoch T <me@enocht.am>, modified by Malcolm Anderson <malcolminyo@gmail.com> for professors (institution management)
//
// AddProfessorModal.jsx

import React, { PropTypes } from 'react'

import { ControlledForm } from '../ControlledForm'
import '../../api/users.js'

/**
 * modal for profs to make new prof accounts
 * @augments ControlledForm
 * @prop {Func} done - done callback
 */
export class AddProfessorModal extends ControlledForm {
    constructor (props) {
        super(props)
        this.state = { newEmail: '' }
        this.newEmailOnChange = this.newEmailOnChange.bind(this)
        this.instAdminCheckboxToggled = this.instAdminCheckboxToggled.bind(this)

        
      }

      componentDidMount() {
        this.setState({instAdminCheckboxState: false})
        console.log("AddProfessorModal is mounted")
      }
    
      /**
       * done(Event: e)
       * Overrided done handler
       */
      done (e) {
        this.refs.newEmailForm.reset()
        this.setState({})
        this.props.done()
      }
    
      newEmailOnChange (e) {
        this.setState({ newEmail: e.target.value })
      }

      instAdminCheckboxToggled (e) {
        console.log(e.target.checked)
        this.setState({instAdminCheckboxState: e.target.checked})
      }
    
      /**
       * handleSubmit(Event: e)
       * onSubmit handler for enroll form. Calls users.promote
       */
      handleSubmit (e) {
        super.handleSubmit(e)

        console.log("handling submit, email = <" + this.state.newEmail + ">, instId = <" + this.state.instId + ">")
    
        if (Meteor.isTest) {
          console.log("just a test")
          this.props.done()
        }

        // This user is going to be an institutional administrator
        if (this.state.instAdminCheckboxState) {
            console.log("making a new institutional admin")
            Meteor.call('institutions.addLocalAdminByEmail', this.state.newEmail, this.props.instId, (error) => {
                if (error) return alertify.error('Error: ' + error.message)
                alertify.success('Institutional administrator added')
                this.done()
            })
        }
        // This user is going to be a normal professor
        else {
            console.log("just a normal professor")
        }
        // Meteor.call('users.promote', this.state.newEmail, (error) => {
        //   if (error) return alertify.error('Error: ' + error.message)
        //   alertify.success('Account promoted')
        //   this.done()
        // })
      }
    
      render () {
        return (<div className='ql-modal-container' onClick={this.done}>
          <div className='ql-modal ql-modal-newemail ql-card' onClick={this.preventPropagation}>
            <div className='ql-modal-header ql-header-bar'><h3>Add a professor</h3></div>
            <form ref='newEmailForm' className='ql-card-content' onSubmit={this.handleSubmit}>
    
              <div className='text'>Type the email address used by the professor's Qlicker account.</div>
    
              <label>Email:</label>
              <input type='email' className='form-control' onChange={this.newEmailOnChange} /><br />
              <input type='checkbox' onClick={this.instAdminCheckboxToggled} /> Make this professor an institutional administrator
    
              <div className='ql-buttongroup'>
                <a className='btn btn-default' onClick={this.done}>Cancel</a>
                <input className='btn btn-default' type='submit' id='submit' />
              </div>
            </form>
          </div>
        </div>)
      } //  end render
    
} // end PromoteAccountModal

AddProfessorModal.propTypes = {
    done: PropTypes.func,
    instId: PropTypes.string
  }
  