// QLICKER
// Author: Malcolm Anderson <malcolminyo@gmail.com>
// institutions.js: object type for an institution/school that professors and courses can be a part of

import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { check, Match } from 'meteor/check'

import { _ } from 'underscore'

import Helpers from './helpers.js'
import { ROLES } from '../configs'

// expected collection pattern
const instPattern = {
    _id: Match.Maybe(Helpers.NEString), // mongo db id
    name: Helpers.NEString, // Information Technology Project (2016-17)
    instructors: Match.Maybe([Helpers.MongoID]),
    sessions: Match.Maybe([Helpers.MongoID]),
    createdAt: Date,
    requireVerified: Match.Maybe(Boolean),
}

export const Institution = function (doc) { _.extend(this, doc) }

export const Institutions = new Mongo.Collection('institutions', { transform: (doc) => { return new Institution(doc) } })
