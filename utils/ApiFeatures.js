class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  Filter() {
    const queryObj = { ...this.queryString };
    // excluded fields
    const excludedFields = ["limit", "page", "fields", "sort"];

    // FILTERING
    excludedFields.forEach((data) => delete queryObj[data]);
    let queryStr = JSON.stringify(queryObj);

    queryStr = JSON.parse(
      queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    );
    this.query = this.query.find(queryStr);
    return this;
  }
  Sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort.split(",").join(" "));
    } else {
      this.query = this.query.sort("-createAt");
    }
    return this;
  }
  FieldLimit() {
    // Field Limiting
    if (this.queryString.fields) {
      this.query = this.query.select(
        this.queryString.fields.split(",").join(" ")
      );
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  Paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 2;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
  Populate() {
    if (!this.queryString.populate) {
      return this;
    }
    this.query = this.query.populate(this.queryString.populate);

    return this;
  }
}

module.exports = ApiFeatures;
