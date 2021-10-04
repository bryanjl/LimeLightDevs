module.exports = async(ctx, next) => {
    let validUser = false;
    if(!ctx.request.body.organization){
        return ctx.response.badRequest(`Please provide organization name`);
    } else {
        let organization = await strapi.services.organization.findOne({ title: ctx.request.body.organization });
        
        if(!organization){
            return ctx.response.notFound(`No organization found with name ${ctx.request.body.organization}`);
        } else {
            organization.users_permissions_users.forEach(user => {
                if(user.email === ctx.state.user.email){
                    validUser = true;
                }
            });
        }   
    }
    if(validUser){
        return await next();
    } else {
        return ctx.unauthorized("You are not a member of this organization");
    }
}