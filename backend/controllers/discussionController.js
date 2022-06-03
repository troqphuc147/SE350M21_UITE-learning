const mongoose = require("mongoose");
const Course = require("../models/course");
const Quizz = require("../models/quizz");
const User = require("../models/user");
const lesson = require("../models/lesson");

class discussionController {
    getLessonandQuizzByCourseID = async(req ,res) => {
        // console.log("req.body", req.body);s
        // console.log("req.params.id", req.params.id);
        try {
            const id = mongoose.Types.ObjectId(req?.params?.id);
            var currentCourse;
            await Course.findById(req.params.id).populate("lessons").populate("teacher")
                .then(data => {
                    currentCourse = data;
                })
                .catch(error => {
                    throw new Error("This course does not exist!");
                })
            // console.log("currentCourse", currentCourse) 

            var currentLessonList = currentCourse.lessons;
            // console.log("currentLessonList", currentLessonList)  
            var allQuizzs;
            
            await Quizz.find()
                .then((data)=>{
                    allQuizzs = data;
                })
                .catch((error)=> {
                    throw new Error("Can't find quizzs");
                })
                // console.log("allQuizzs", allQuizzs)

            // Sau khi get all quizz thì sau đó quăng vào từng lesson
            var temptLessonList = [] ;
            for(var i = 0; i < currentLessonList.length; i++){
                var tempQuizz = [];
                for(var k = 0; k < currentLessonList[i].quizz.length; k++){
                    for(var j = 0; j < allQuizzs.length; j++){    
                        // console.log(currentLessonList[i].quizz[k].toString(), allQuizzs[j]._id.toString())
                        if(currentLessonList[i].quizz[k].toString() == allQuizzs[j]._id.toString()){
                            tempQuizz.push({
                                _id: currentLessonList[i].quizz[k],
                                quizzCode: allQuizzs[j].quizzCode,
                                question:  allQuizzs[j].question,
                                choice:  allQuizzs[j].choice,
                                answer: allQuizzs[j].answer,
                            });
                            break;
                        }
                    }
                }
                temptLessonList.push({
                    ...currentLessonList[i]._doc,
                    quizz: tempQuizz,
                })
            }   
            // console.log("temptLessonList",...temptLessonList);   
            // for(var i = 0; i < temptLessonList.length; i++){
            //     console.log("temptLessonList[i]", temptLessonList[i])
            // }

            // Lấy được các lesson giờ lấy thêm phần các bình luận
            var currentDiscussion = currentCourse.discussion;
            var userData;
            await User.find()
                .then(data => {
                    userData = data;
                })
                .catch((err)=> {
                    
                })

            // console.log("userData", userData)
            // refine each discussion and it's replied
            var newDiscussion = []; 
            // console.log("currentDiscussion", currentDiscussion)
            for(var i = 0; i < currentDiscussion.length; i++){
                var tempt = {};
                var replyRefine = [];
                for(var j = 0; j < currentDiscussion[i].repliedComments.length; j++){
                    for(var k = 0; k < userData.length; k++){
                        // console.log(currentDiscussion[i].repliedComments[j]._id.toString(), userData[k]._id.toString());
                        if(currentDiscussion[i].repliedComments[j].user.toString() == userData[k]._id.toString()){
                            replyRefine.push({
                                ...currentDiscussion[i].repliedComments[j],
                                username: userData[j].fullName,
                                userID: userData[j]._id,
                                avatar: userData[j].profilePicture,
                            })
                            break;
                        }
                    }
                }
                for(var j = 0; j < userData.length; j++){
                    if(currentDiscussion[i].comment.user.toString() == userData[j]._id.toString()){
                        tempt.comment = {
                            ...currentDiscussion[i].comment,
                            username: userData[j].fullName,
                            userID: userData[j]._id,
                            avatar: userData[j].profilePicture,
                            repliedComments: replyRefine,
                        }
                        break;
                    }
                }
                newDiscussion.push(tempt);
            }

            // console.log("newDiscussion", newDiscussion)
            
            res.status(200).send({
                run: true,      
                currentCourse: {
                    ...currentCourse._doc,
                    lessons: temptLessonList,
                    discussion: newDiscussion,
                }
            })


        } catch (error) {   
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
        
    }

    getUserInformation = async(req, res) => {
        // console.log("req.body", req.body);
        // console.log("req.params.id", req.params.id)

        User.findById(req.params.id).exec()
            .then((data) => {
                if(data)
                    return res.status(200).send({
                        run: true,
                        success: true,
                        data: data
                    })
                else
                    return res.status(200).send({
                        success: false,
                        run: true,
                        message: "User not found",
                    })
            })
            .catch((error) =>{
                res.status(400).send({
                    run: false,
                    message: "Can't get user",
                })
            })
        
    }

    passTheQuizz = async(req, res) => {
        // console.log("req.body", req.body);
        // Find current lesson
        var currentLesson;
        await lesson.findById(req.body.lessonID)
            .then((data) => {
                currentLesson = data;
            })
            .catch((error) => {
                return res.status(404).send({
                    success: false,
                    message: "Lesson of quizz not found!"
                })
            })
        // console.log("currentLesson", currentLesson);
        var findID = false;
        for(var i = 0 ; i < currentLesson.passed.length; i++){
            if(currentLesson.passed[i].user==req.body.userID){
                findID = true;
                break;
            }
        }
        if(!findID)
            currentLesson.passed.push({
                user: req.body.userID,
                passed: true,
            })
        else {
            return res.status(400).send({
                success: false,
                message: "Error when update lesson"
            })
            return;
        }

        await lesson.findByIdAndUpdate(req.body.lessonID, {
            passed: currentLesson.passed
        })
            .then((data) => {
                res.status(200).send({
                    success: false,
                    message: "Add passed student successful"
                })
            })
            .catch((error) => {
                return res.status(400).send({
                    success: false,
                    message: "Error when update lesson"
                })
            })


    }

    addComment = async(req, res ) => {
        // console.log("req.body", req.body);

        var currentCourse;
        await Course.findById(req.body.courseID)
            .then((data) => {
                currentCourse = data
            })
            .catch((error) => {
                return res.status(404).send({
                    success: false,
                    message: "Course not found"
                })
            })
        // console.log(currentCourse);
        if(req.body.parrentCommentID == "") {
            var currentDiscussion = currentCourse.discussion;
            currentDiscussion.push({
                _id: mongoose.Types.ObjectId(),
                comment: {
                    _id: mongoose.Types.ObjectId(),
                    user: req.body.userID,
                    content: req.body.content,
                    time: new Date(),
                    likes: []
                },
                repliedComments: []
            })
            // console.log(currentDiscussion);
            await Course.findByIdAndUpdate(req.body.courseID, {
                discussion: currentDiscussion
            })
                .then((data) => {
                    
                })
                .catch(() => {
                    return res.status(400).send({
                        success: false,
                        message: "Can't update course!"
                    })
                })
                // Trả về tất cả thông tin của khoá học
                try {
                    var currentCourse;
                    await Course.findById(req.body.courseID).populate("lessons").populate("teacher")
                        .then(data => {
                            currentCourse = data;
                        })
                        .catch(error => {
                            throw new Error("This course does not exist!");
                        })
                    var currentLessonList = currentCourse.lessons; 
                    var allQuizzs;
                    
                    await Quizz.find()
                        .then((data)=>{
                            allQuizzs = data;
                        })
                        .catch((error)=> {
                            throw new Error("Can't find quizzs");
                        })
                    // Sau khi get all quizz thì sau đó quăng vào từng lesson
                    var temptLessonList = [] ;
                    for(var i = 0; i < currentLessonList.length; i++){
                        var tempQuizz = [];
                        for(var k = 0; k < currentLessonList[i].quizz.length; k++){
                            for(var j = 0; j < allQuizzs.length; j++){    
                                if(currentLessonList[i].quizz[k].toString() == allQuizzs[j]._id.toString()){
                                    tempQuizz.push({
                                        _id: currentLessonList[i].quizz[k],
                                        quizzCode: allQuizzs[j].quizzCode,
                                        question:  allQuizzs[j].question,
                                        choice:  allQuizzs[j].choice,
                                        answer: allQuizzs[j].answer,
                                    });
                                    break;
                                }
                            }
                        }
                        temptLessonList.push({
                            ...currentLessonList[i]._doc,
                            quizz: tempQuizz,
                        })
                    }   
        
                    // Lấy được các lesson giờ lấy thêm phần các bình luận
                    var currentDiscussion = currentCourse.discussion;
                    var userData;
                    await User.find()
                        .then(data => {
                            userData = data;
                        })
                        .catch((err)=> {
                            
                        })
        
                    var newDiscussion = []; 
                    for(var i = 0; i < currentDiscussion.length; i++){
                        var tempt = {};
                        var replyRefine = [];
                        for(var j = 0; j < currentDiscussion[i].repliedComments.length; j++){
                            for(var k = 0; k < userData.length; k++){
                                if(currentDiscussion[i].repliedComments[j].user.toString() == userData[k]._id.toString()){
                                    replyRefine.push({
                                        ...currentDiscussion[i].repliedComments[j],
                                        username: userData[j].fullName,
                                        userID: userData[j]._id,
                                        avatar: userData[j].profilePicture,
                                    })
                                    break;
                                }
                            }
                        }
                        for(var j = 0; j < userData.length; j++){
                            if(currentDiscussion[i].comment.user.toString() == userData[j]._id.toString()){
                                tempt.comment = {
                                    ...currentDiscussion[i].comment,
                                    username: userData[j].fullName,
                                    userID: userData[j]._id,
                                    avatar: userData[j].profilePicture,
                                    repliedComments: replyRefine,
                                }
                                break;
                            }
                        }
                        newDiscussion.push(tempt);
                    }
                    
                    res.status(200).send({
                        success: true,
                        message: "Add comment successfully!",     
                        currentCourse: {
                            ...currentCourse._doc,
                            lessons: temptLessonList,
                            discussion: newDiscussion,
                        }
                    })
        
        
                } catch (error) {   
                    return res.status(404).send({
                        success: false,
                        message: "Course not found"
                    })
                }
        }
    }
}

module.exports =  new discussionController();