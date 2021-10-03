'use strict';

const { sanitizeEntity } = require('strapi-utils');

module.exports = {
    async create(ctx) {
        let organization = await strapi.services.organization.findOne({ title: ctx.request.body.organization });

        if(!organization){
            return ctx.response.notFound(`Organization ${ctx.request.body.organization} not found`)
        }

        let job = await strapi.services.jobs.create({
            title: ctx.request.body.title,
            description: ctx.request.body.description,
            organization: organization,
            users_permissions_user: ctx.state.user
        });

        let jobsArr = organization.jobs;
        jobsArr.push(job);

        //update organization with new array of jobs
        organization = await strapi.query('organization').update({ id: organization.id }, {
            jobs: jobsArr
        });

        return sanitizeEntity(job, { model: strapi.models.jobs });
    }
};