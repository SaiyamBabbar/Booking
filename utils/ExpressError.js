class ExpressError extends Error{
    constructor(statusCode,mesage){
        super();
        this.statusCode=statusCode;
        this.message=mesage;
    }
} 

module.exports=ExpressError;