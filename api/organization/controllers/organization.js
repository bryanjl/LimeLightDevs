'use strict';

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
    async create(ctx) {  
        //error with saving relational data in Mongo
        //hacked together solution :(     
        let arr = [];
        arr.push(ctx.state.user);

        ctx.request.body.users_permissions_users = arr;
        ctx.request.body.owner = ctx.state.user.email;
        let organization = await strapi.services.organization.create(ctx.request.body);
        
        return sanitizeEntity(organization, { model: strapi.models.organization });
    }, 

    async createOrganizationUser(ctx) {
        //find organization based on submitted organization name --> should be organization password
        let organization = await strapi.services.organization.findOne({ title: ctx.request.body.organization })

        if(!organization){
            return ctx.response.notFound(`Organization ${ctx.request.body.organization} Not Found`);
        }

        let usersArr = organization.users_permissions_users;
        usersArr.forEach(user => {
            if (user.email === ctx.state.user.email){
                return ctx.response.badRequest(`You are already registered with this organization`);
            }
        });
        
        usersArr.push(ctx.state.user);

        //update organization with new array of organizational users
        organization = await strapi.query('organization').update({ id: organization.id }, {
            users_permissions_users: usersArr
        });

        return sanitizeEntity(organization, { model: strapi.models.organization });
    },

    async deleteOrganizationUser(ctx) {
        let organization = await strapi.services.organization.findOne({ title: ctx.request.body.organization });

        if(!organization){
            return ctx.response.notFound(`Organization ${ctx.request.body.organization} Not Found`);
        }

        let usersArr = organization.users_permissions_users;

        //owner of organization cannot delete themself from array of organization members
        if(!ctx.request.body.email && organization.owner === ctx.state.user.email){
            return ctx.response.badRequest(`You are the owner of this organization and cannot delete yourself from the organization's members`);
        }
        if(ctx.request.body.email === ctx.state.user.email && organization.owner === ctx.state.user.email){
            return ctx.response.badRequest(`You are the owner of this organization and cannot delete yourself from the organization's members`);
        }

        //a member cannot by someone else other than the owner of the organization
        if(ctx.request.body.email && organization.owner != ctx.state.user.email) {
            return ctx.response.badRequest(`You must be the owner of this organization to remove members`)
        } 

        //user to be removed either from request body or a non-owner member can remove themselves from an organization
        let userEmail;
        (ctx.request.body.email) ? userEmail = ctx.request.body.email : userEmail = ctx.state.user.email;

        let index = -1;
        for(let i = 0 ; i < usersArr.length; i++){
            if(usersArr[i].email === userEmail){
                index = i;
                break;
            }
        }
        if(index < 0){
            return ctx.response.notFound(`User with email ${userEmail} not found in this organization`);
        }

        usersArr.splice(index, 1);

        organization = await strapi.query('organization').update({ id: organization.id }, {
            users_permissions_users: usersArr
        });

        return sanitizeEntity(organization, { model: strapi.models.organization });
    },

    async findFirst(ctx) {
        let firstOrganization = await strapi.services.organization.find({_start:0, _limit:1});
            
        return sanitizeEntity(firstOrganization, { model: strapi.models.organization });
    }
};


