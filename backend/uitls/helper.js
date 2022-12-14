const crypto = require('crypto')

exports.sendError = (res, errorMsg, statusCode = 401) => {
    res.status(statusCode).json({ error: errorMsg })
}

exports.generateRandomByte = () => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(30, (err, buff) => {
            if (err) reject(err);
            const buffString = buff.toString('hex')
            console.log(buffString)
            resolve(buffString)
        })
    });
}

exports.handleNotFound = (req, res) => {
    this.sendError(res, "Not Found", 404)
}

exports.uploadImageToCloud = async (file) => {
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
        file,
        { gravity: "face", height: 500, width: 500, crop: "thumb" }
    );

    return { url, public_id };
};

exports.formatCustomer = customer => {
    const { name, email, contact, company, _id } = customer
    return {
        id: _id,
        name,
        email,
        contact,
        company,
    }
}

exports.formatMenuItem = menu => {
    const { name, description, type, price, image, _id } = menu
    return {
        id: _id,
        name,
        description,
        type,
        price,
        image: image?.url
    }
}
exports.averageRatingPipeline = (movieId) => {
    return [
        {
            $lookup: {
                from: "Review",
                localField: "rating",
                foreignField: "_id",
                as: "avgRat"
            }
        },
        {
            $match: { parentMovie: movieId }
        },
        {
            $group: {
                _id: null,
                ratingAvg: {
                    $avg: '$rating'
                },
                reviewCount: {
                    $sum: 1
                }
            }
        }
    ]
}

exports.relatedMovieAggragation = (tags, movieId) => {
    return [
        {
            $lookup: {
                from: "Movie",
                localField: "tags",
                foreignField: "_id",
                as: "relatedMovies"
            }
        },
        {
            $match: {
                tags: { $in: [...tags] },
                _id: { $ne: movieId }
            }
        },
        {
            $project: {
                title: 1,
                poster: "$poster.url",
                responsivePosters: "$poster.responsive"
            }
        },
        {
            $limit: 5
        }
    ]
}

exports.topRatedMoviesPipeline = (type) => {
    const matchOptions = {
        reviews: { $exists: true },
        status: { $eq: 'public' }
    }

    if (type) matchOptions.type = { $eq: type };
    return [
        {
            $lookup: {
                from: "Movie",
                localField: "reviews",
                foreignField: "_id",
                as: "topRated"
            }
        },
        {
            $match: matchOptions,
        },
        {
            $project: {
                title: 1,
                poster: "$poster.url",
                responsivePosters: "$poster.responsive",
                reviewCount: { $size: '$reviews' }
            }
        },
        {
            $sort: {
                reviewCount: -1
            }
        },
        {
            $limit: 5
        }
    ]
}

exports.getAverageRatings = async (movieId) => {
    const [aggregatedResponse] = await Review.aggregate(this.averageRatingPipeline(movieId))

    const reviews = {};

    if (aggregatedResponse) {
        const { ratingAvg, reviewCount } = aggregatedResponse
        reviews.ratingAvg = parseFloat(ratingAvg).toFixed(1)
        reviews.reviewCount = reviewCount
    }

    return reviews
}