// QLICKER
// Author: Malcolm Anderson <malcolminyo@gmail.com>
// institutions.js: object type for an institution/school that professors and courses can be a part of

import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { check, Match } from 'meteor/check'

import { _ } from 'underscore'

import Helpers from './helpers.js'
import { ROLES } from '../configs'

console.log("Hello from institutions.js!")

// expected collection pattern
const instPattern = {
    _id: Match.Maybe(Helpers.NEString), // mongo db id
    name: Helpers.NEString,
    instructors: Match.Maybe([Helpers.MongoID]),
    createdAt: Date,
    requireVerified: Match.Maybe(Boolean),
}

export const Institution = function (doc) { _.extend(this, doc) }

export const Institutions = new Mongo.Collection('institutions', { transform: (doc) => { return new Institution(doc) } })


if (Meteor.isServer) {
    Meteor.publish('institutions'), function () {
        if (this.userId) {
            this.ready()
            return Institutions.find()
        }
    }
}
/**
 * Meteor methods for courses object
 * @module institutions
 */
Meteor.methods({
    'institutions.insert'(data) {
        console.log("INSERT INSTITUTION")
        check(data, instPattern)
        console.log("Inserting a new institution")

        const institutionOut = Institutions.insert(data, (e, id) => {
            if (e) {
                console.log("ERROR CREATING INSTITUTION: " + e)
                alertify.error('Error creating institution')
            }
            else {
                console.log("INSTITUTION CREATED SUCCESSFULLY??")
                // Meteor.users.update({'profile.roles': 'admin'}, {$addToSet: { 'profile.institutions': id }}, {multi: true})
                // Meteor.users.update({ _id: Meteor.userId() }, {
                //     $addToSet: { 'profile.institutions': id }
                // })
            }
        })

        console.log(("END INSERT INSTITUTION ---------------------"))
        return institutionOut
    } 

});