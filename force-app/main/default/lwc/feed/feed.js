import { LightningElement, wire, track, api } from 'lwc';
import addComment from '@salesforce/apex/WorkplaceController.addComment';
import getComments from '@salesforce/apex/WorkplaceController.getComments';
import getUser from '@salesforce/apex/WorkplaceController.getUser';


export default class Feed extends LightningElement {
    @api post;
    @api userId;
    @track currentUserImage;

    // Show comment box on click
    showComment = false; //default to false
    // Comments Array
    @track comments = [];

    handleCommentToggle(event) {
        const postId = event.currentTarget.value;
        this.fetchComments(postId);
        this.showComment = !(this.showComment);
    }
    comment(event) {
        const postComment = this.template.querySelector("lightning-input");
        const comment = {
            comment: postComment.value,
            commentedOn: event.currentTarget.value,
            commentedBy: this.userId
        }
        addComment({ payload: JSON.stringify(comment) }).then(response => {
            this.fetchComments(comment.commentedOn);
        }).catch(error => {
            console.error('Error in creating comment' + error);
        });
        postComment.value = "";
    }

    async fetchComments(postId) {
        try {
            const comments = await getComments({ postId });
            if (comments) {
                let updatedComments = [];
                for (let comment of comments) {
                    comment.user = (await getUser({ userId: comment.CommentedBy__c }))[0];
                    updatedComments.push(comment);
                }
                this.comments = updatedComments;
            }
        } catch (error) {
            console.error('Error in fetching post' + error);
        }
    }

    @wire(getUser, { userId: '$userId' }) user(data, error) {
        if (data.data) {
            this.currentUserImage = data.data[0].Avataar__c;
        } else {
            console.error(error);
        }
    }
}