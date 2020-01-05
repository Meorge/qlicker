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
    localAdmins: Match.Maybe([Helpers.MongoID]),
    createdAt: Date,
    requireVerified: Match.Maybe(Boolean),
}

export const Institution = function (doc) { _.extend(this, doc) }

export const Institutions = new Mongo.Collection('institutions', { transform: (doc) => { return new Institution(doc) } })


if (Meteor.isServer) {
    Meteor.publish('institutions.single', function(instId) {
        return Institutions.findOne({_id: instId })
    });
    
    Meteor.publish('institutions', function () {
        // return this.ready()
        return Institutions.find();
        // if (this.userId) {
        //     let user = Meteor.users.findOne({ _id: this.userId })
        //     if (user.hasGreaterRole(ROLES.admin)) {
        //       return Institutions.find()
        //     }
        // }
    });
}
/**
 * Meteor methods for courses object
 * @module institutions
 */
Meteor.methods({
    'institutions.insert'(data) {
        check(data, instPattern)

        const institutionOut = Institutions.insert(data, (e, id) => {
            if (e) {
                console.log("ERROR CREATING INSTITUTION: " + e)
                alertify.error('Error creating institution')
            }
            else {
                console.log("Institution created successfully!")
                console.log("Institutions: " + Object.keys(Institutions.find({ }, { sort: {name : 1, createdAt: -1}}).fetch()))
                // Meteor.users.update({'profile.roles': 'admin'}, {$addToSet: { 'profile.institutions': id }}, {multi: true})
                // Meteor.users.update({ _id: Meteor.userId() }, {
                //     $addToSet: { 'profile.institutions': id }
                // })
            }
        })
        return institutionOut
    },
    
    'institutions.delete'(id) {
        // TODO: once there are more properties associated with institutions, we've gotta remove those too (see courses.js)
        return Institutions.remove({ _id: id })
    }

});