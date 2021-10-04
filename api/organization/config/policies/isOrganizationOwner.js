module.exports = async (ctx, next) => {
    //find organization by title(name of organization) (could change to other identifer)
    let organization = await strapi.services.organization.findOne({ id: ctx.params.id });

    //check if current user is organization owner   
    if(organization.owner === ctx.state.user.email){
        return await next();
    } else {
        return ctx.unauthorized('You are not the owner of this organization');
    } 
}