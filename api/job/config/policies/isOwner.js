module.exports = async(ctx, next) => {
    let job = await strapi.services.jobs.findOne({ id: ctx.params.id });

    if(!job){
        return ctx.response.notFound(`Job posting with id of ${ctx.params.id} not found`);
    }

    if(job.users_permissions_user.email === ctx.state.user.email || ctx.state.user.organization_role === 'Organization_Admin'){
        return await next();
    } else {
        return ctx.unauthorized(`You are not the owner of this job posting`);
    }
}
