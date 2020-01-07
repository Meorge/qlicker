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
        return Institutions.find({_id: instId })
    });

    // Meteor.publish('institutions.localAdmins', function(instId) {
    //     return Institutions.find({_id: instId })
    // });

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
    },


    'institutions.addLocalAdminByEmail'(email, instId) {
        console.log("email = <" + email + ">, instId = <" + instId + ">")
        check(email, Helpers.Email)
        check(instId, Helpers.MongoID)
    
        const user = Meteor.users.findOne({ 'emails.0.address': email })
        if (!user) throw new Meteor.Error('user-not-found', 'User not found')
    
        // not checking if user.profile also contains course, probably should//TODO
        let inst = Institutions.findOne({ _id: instId })
        if (inst.localAdmins && inst.localAdmins.includes(user._id)) {
          throw new Meteor.Error('This user is already an institutional administrator for this institution', 'This user is already an institutional administrator for this institution')
        }
    
        Meteor.users.update({ _id: user._id }, {
          $addToSet: { 'profile.instAdminForInstitutions': instId }
        })
    
        const updated = Institutions.update({ _id: instId }, {
          '$addToSet': { localAdmins: user._id }
        })
        return updated
      },

      'institutions.addProfessorByEmail'(email, instId) {
        console.log("email = <" + email + ">, instId = <" + instId + ">")
        check(email, Helpers.Email)
        check(instId, Helpers.MongoID)
    
        const user = Meteor.users.findOne({ 'emails.0.address': email })
        if (!user) throw new Meteor.Error('user-not-found', 'User not found')
    
        // not checking if user.profile also contains course, probably should//TODO
        let inst = Institutions.findOne({ _id: instId })
        if (inst.instructors && inst.instructors.includes(user._id)) {
          throw new Meteor.Error('This user is already a professor for this institution', 'This user is already a professor for this institution')
        }
    
        Meteor.users.update({ _id: user._id }, {
          $addToSet: { 'profile.profForInstitutions': instId }
        })
    
        const updated = Institutions.update({ _id: instId }, {
          '$addToSet': { instructors: user._id }
        })
        return updated
      },
      
    'institutions.removeLocalAdmin'(id, userId) {
        // TODO: once there are more properties associated with institutions, we've gotta remove those too (see courses.js)
        return Institutions.update({ _id: id }, {
            $pull: { localAdmins: userId }
          })
    }

});