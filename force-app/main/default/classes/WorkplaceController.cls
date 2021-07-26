public with sharing class WorkplaceController {
    // get all users
    //The method is cacheable, means the response will cached in the browser
    @AuraEnabled(cacheable=true)
    public static List<WorkUsers__c> getAllUsers() {
        return [SELECT Id, Name, Role__c FROM WorkUsers__c];
    }
    // get user by id
    @AuraEnabled(cacheable=true)
    public static List<WorkUsers__c> getUser(string userId) {
        return [SELECT Id, Name, Role__c, Avataar__c FROM WorkUsers__c WHERE Id = :userId];
    }
    // add post posted by user
    @AuraEnabled
    public static string addPost(String payload){
        try {
            Post payloadObject = (Post) JSON.deserialize(payload, Post.class);

            SObject tsk  =  (SObject) Type.forName('Post__c').newInstance();
            tsk.put('Name', payloadObject.post);
            tsk.put('PostedBy__c', payloadObject.postedBy);

            insert tsk;

            return String.valueOf(tsk.Id);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    // ADD Comment By User on post
    @AuraEnabled
    public static string addComment(String payload){
        try {
            Comment payloadObject = (Comment) JSON.deserialize(payload, Comment.class);

            SObject tsk  =  (SObject) Type.forName('Comment__c').newInstance();
            tsk.put('Name', payloadObject.comment);
            tsk.put('CommentedBy__c', payloadObject.commentedBy);
            tsk.put('CommentedOn__c', payloadObject.commentedOn);

            insert tsk;

            return String.valueOf(tsk.Id);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    // Get All Posts
    @AuraEnabled
    public static List<Post__c> getPosts(){
        try {
            return [SELECT Id, Name, CreatedDate, PostedBy__c FROM Post__c ORDER BY CreatedDate DESC];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    // Get Commment
    @AuraEnabled
    public static List<Comment__c> getComments(String postId){
        try {
            return [SELECT Id, Name, CreatedDate, CommentedBy__c, CommentedOn__c FROM Comment__c WHERE CommentedOn__c = :postId ORDER BY CreatedDate DESC];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    // Add Like on Post
    @AuraEnabled
    public static string toggleLike(String payload){
        try {
            LikePost payloadObject = (LikePost) JSON.deserialize(payload, LikePost.class);

            // select * from likes where likedBy and postId
            // if the above query given the result
            // then remove it. which will be equal to remove like
            // else add it which will be equal to like
            List<Like__c> searchLike = [SELECT Id FROM Like__c 
                                        WHERE LikedOnPost__c = :payloadObject.likedOnPost 
                                        AND LikedBy__c = :payloadObject.likedBy
                                    ];
            if(searchLike.size() > 0){
                List<Like__c> removeLike = [SELECT Id FROM Like__c WHERE LikedOnPost__c = :payloadObject.likedOnPost AND LikedBy__c = :payloadObject.likedBy];
                delete removeLike;
                return 'unliked';
             }else { 
                SObject tsk  =  (SObject) Type.forName('Like__c').newInstance();
                tsk.put('LikedBy__c', payloadObject.likedBy);
                tsk.put('LikedOnPost__c', payloadObject.likedOnPost);
                insert tsk;
                return String.valueOf(tsk.Id);
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    // Fetch Like
    @AuraEnabled
    public static List<Like__c> getLikes(String postId){
        try {
            return [SELECT Id, LikedOnPost__c, LikedBy__c FROM Like__c WHERE LikedOnPost__c = :postId];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    class Post{
        @AuraEnabled
        public String post;
        @AuraEnabled
        public String postedBy;
    }
    class Comment{
        @AuraEnabled
        public String comment;
        @AuraEnabled
        public String commentedBy;
        @AuraEnabled
        public String commentedOn;
    }
    class LikePost{
        @AuraEnabled
        public String likedBy;
        @AuraEnabled
        public String likedOnPost;
    }

}
