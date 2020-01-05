/* global confirm  */
// QLICKER
// Author: Enoch T <me@enocht.am>, modified by Malcolm Anderson <malcolminyo@gmail.com>
//
// InstitutionListItem.jsx (modified from CourseListItem.jsx)

import React, { PropTypes } from 'react'

import { ListItem } from './ListItem'
import '../api/institutions.js'

/**
 * React component list item for each institution.
 * only used on admin page???
 * @class
 * @augments ListItem
 * @prop {Institution} inst - institution object
 * @prop {Func} [click] - list item click handler
 */
export class InstitutionListItem extends ListItem {

  render () {
    const controls = this.makeControls()
    const className = this.props.inactive ? 'ql-course-list-item-inactive ql-list-item  ' : 'ql-course-list-item ql-list-item '
    return (
      <div className={className + (this.props.click ? 'click' : '')} onClick={this.click}>
        <span className='ql-course-name'>{ this.props.inst.name }</span>

        { this.props.controls ? <span className='controls'>{controls}</span> : '' }
      </div>)
  } //  end render

}

InstitutionListItem.propTypes = {
  inst: PropTypes.object.isRequired,
  click: PropTypes.func
}
