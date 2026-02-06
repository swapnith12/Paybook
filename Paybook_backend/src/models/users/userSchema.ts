import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";

const userType = new GraphQLObjectType({
    name:'users',
    fields:()=>(
        {
            Id:{
                type:GraphQLString
            },
            name:{
                type:GraphQLString
            },
            password:{
                type:GraphQLString
            }
        }
    )
})


const rootQuery = new GraphQLObjectType({
    name:'rootquery',
    fields:()=>({
        user:{
            type:userType,
            args:{name:{type:GraphQLString}},
            resolve(parent,args){
                return{
                    Id:"1",
                    name:args.name,
                }
            }
        }
    })
})


export default new GraphQLSchema({
    query:rootQuery,
})