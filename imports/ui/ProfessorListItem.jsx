/* global confirm  */
// QLICKER
// Author: Enoch T <me@enocht.am>, modified by Malcolm Anderson <malcolminyo@gmail.com> for professors
//
// ProfessorListItem.jsx

import React, { PropTypes } from 'react'

import { ListItem } from './ListItem'
import '../api/courses.js'

/**
 * React component list item professors
 * typically used in professor course screen
 * @augments ListItem
 * @prop {User} prof - user object
 */
export class ProfessorListItem extends ListItem {

  componentDidMount() {
    this.renderTag = this.renderTag.bind(this)
  }

  renderTag() {
    if (this.props.isInstAdmin) {
      return (<span className='student-tag tag-gold'>Institutional Administrator</span>)
    } else {
      return (<span className='student-tag tag-silver'>Professor</span>)
    }
  }

  render () {
    const controls = this.makeControls()
    let role = ''
    if (this.props.role) {
      role += ' (' + this.props.role + ')'
    }

    return (
      <div className='ql-student-list-item ql-list-item' onClick={this.click}>
        <div
          className='img-circle ql-profile-image'
          style={{
            backgroundImage: 'url(' + this.props.prof.getThumbnailUrl() + ')'
          }} />
        <div className='student-details'>
          <span className='student-name'>{ this.props.prof.getName() + role }</span>
          {this.renderTag()}
          <span className='student-email'>{ this.props.prof.getEmail() } </span>
        </div>
        <div className='controls'>{controls}</div>
      </div>)
  } //  end render

}

ProfessorListItem.propTypes = {
  prof: PropTypes.object.isRequired,
  isInstAdmin: PropTypes.bool
}
