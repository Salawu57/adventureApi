class APIFEATURES{
   
    constructor(query, queryString){
      this.query = query;
      this.queryString = queryString;


 }

    filter(){

      let newQuery ={...this.queryString};

      const unWantedOption = ["sort","limit","page","fields"];

      unWantedOption.forEach(el => delete newQuery[el])

      let newQueryStr = JSON.stringify(newQuery);

      newQueryStr = newQueryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

      this.query.find(JSON.parse(newQueryStr));

      return this;
     
    }

    sort(){

      if(this.queryString.sort){

        let sortValue = this.queryString.sort;

        sortValue = sortValue.split(',').join(' ');

         this.query.sort(sortValue)

      }else{

       this.query.sort('-createdAt')
      }

     return this;
    }

    limitFields(){

      if(this.queryString.fields){

        let fieldsValue = this.queryString.fields;

        fieldsValue = fieldsValue.split(",").join(' ');

        this.query.select(fieldsValue);

      }else{

        this.query.select('-__v')

      }

      return this;
    }


    paginate(){

      if(this.queryString.page){

        const reqPage = this.queryString.page * 1 || 1 ;

        const limit = this.queryString.limit * 1 || 100;

        const skipValue = (reqPage - 1 ) * limit;
        
        // console.log(`${reqPage} and ${limit} with ${skipValue}`);

       this.query.skip(skipValue).limit(limit);

      }


      return this;

    }


  }

  module.exports = APIFEATURES