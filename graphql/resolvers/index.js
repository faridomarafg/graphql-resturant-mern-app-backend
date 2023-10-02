const userResolver = require('./userResolver');
const foodResolver = require('./foodeResolver');
const orderResolver = require('./orderRsolver');

module.exports = {
    Query:{
        ...userResolver.Query,
        ...foodResolver.Query,
        ...orderResolver.Query
    },

    Mutation:{
        ...userResolver.Mutation,
        ...foodResolver.Mutation,
        ...orderResolver.Mutation,
    }
}