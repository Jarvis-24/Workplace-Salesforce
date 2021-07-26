import { LightningElement, track, api } from 'lwc';
import toggleLike from '@salesforce/apex/WorkplaceController.toggleLike';

export default class Like extends LightningElement {
    @api post;
    @api userId;
    @track like = false;
    @track likeLength;
    @track likeLabel = 'Like';

    connectedCallback() {
        this.like = this.post.isLiked;
        this.likeLabel = this.post.isLiked ? 'Liked' : "Like";
        this.likeLength = JSON.parse(JSON.stringify(this.post.likeLength));
    }

    likePost(event) {
        console.log("likeLength", this.likeLength);
        const postId = event.currentTarget.value;
        const likeToggle = {
            likedBy: this.userId,
            likedOnPost: postId
        }
        toggleLike({ payload: JSON.stringify(likeToggle) }).then(response => {
            this.likeLabel = (response === 'unliked' ? 'Like' : "Liked");
            this.like = response !== 'unliked';
            this.likeLength = (response !== 'unliked' ? this.likeLength +=1 : this.likeLength);
            this.likeLength = (response === 'unliked' ? this.likeLength -=1 : this.likeLength);
        }).catch(error => {
            console.error('Error in creating comment' + error);
        });


    }

}