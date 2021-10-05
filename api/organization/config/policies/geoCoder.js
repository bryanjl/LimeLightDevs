const NodeGeocoder = require('node-geocoder');

module.exports = async(ctx, next) => {
    let options = {
        provider: process.env.GEOCODER_PROVIDER,
        httpAdapter: 'https',
        apiKey: process.env.GEOCODER_API_KEY,
        formatter: null
    }

    const geocoder = NodeGeocoder(options);

    let location = await geocoder.geocode(ctx.request.body.location);

    
    if(!location){
        return await next();
    } else {
        ctx.request.body.location = location[0].formattedAddress;
        return await next();
    }
}