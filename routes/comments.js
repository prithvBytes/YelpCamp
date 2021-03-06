var express = require("express");
var router = express.Router({mergeParams : true});
var Comment = require("../models/comment");
var Campground = require("../models/campground");
var middleware = require("../middleware");

router.get("/campgrounds/:id/comments/new",middleware.isLoggedIn,function(req,res){
	Campground.findById(req.params.id,function(err,foundCampground){
		if(err){
			req.flash("error","error : "+err.message);
		}else{
			res.render("comments/new",{campground:foundCampground});
		}
	})
});

router.post("/campgrounds/:id/comments",middleware.isLoggedIn,function(req,res){
	//find the campground by id
	Campground.findById(req.params.id).populate("comments").exec(function(err,campground){
		if(err){
			req.flash("error",err.message);
			res.redirect("/campgrounds/"+req.params.id);
		}else{
			Comment.create(req.body.comment,function(err,comment){
				if(err){
					req.flash("error","Something Went Wrong!!!")
					res.redirect("back");
				}else{
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success","Comment Added!!")
					res.redirect("/campgrounds/"+campground._id);
				}
			});
		}
	});
});

router.get("/campgrounds/:id/comments/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
	Comment.findById(req.params.comment_id,function(err,foundComment){
		if(err){
			req.flash("error",err.message);
			res.redirect("back");
		}else{
			res.render("comments/edit",{campground_id:req.params.id,comment:foundComment});
		}
	})
});

router.put("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
		if(err){
			req.flash("error",err.message);
			res.redirect("back");
		}else{
			res.redirect("/campgrounds/"+req.params.id);
		}
	})
})

router.delete("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndDelete(req.params.comment_id,function(err){
		if(err){
			req.flash("error",err.message);
			res.redirect("back");
		}else{
			req.flash("success","Comment Deleted!!!!")
			res.redirect("/campgrounds/"+req.params.id);
		}
	})
})

module.exports = router;