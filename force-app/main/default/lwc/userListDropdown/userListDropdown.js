import { LightningElement, wire, track } from 'lwc';
import getAllUsers from '@salesforce/apex/WorkplaceController.getAllUsers';
import addPost from '@salesforce/apex/WorkplaceController.addPost';
import getPosts from '@salesforce/apex/WorkplaceController.getPosts';
import getUser from '@salesforce/apex/WorkplaceController.getUser';
import getLikes from '@salesforce/apex/WorkplaceController.getLikes';

export default class UserListDropdown extends LightningElement {

    @track value = "";
    userId;
    @track userOptions = [];
    // POST Array
    @track posts = [];
    @track ifPostsAreAvailable = false;

    @wire(getAllUsers)
    users(data, error) {
        if (data.data) {
            this.userOptions = data.data.map((d) => ({ label: d.Name, value: d.Id }));
        } else {
            console.error(error);
        }
    };
    // LifecycleMethod
    connectedCallback() {
        
    }

    // Populating User in dropdwon combobox
    get options() {
        return this.userOptions;
    }
    // Getting the selected user from html
    selectedUser(event) {
        this.userId = event.detail.value;
        this.fetchPosts();
    }

    // POST BY USER
    // post posted by user
    post() {
        const userPost = this.template.querySelector("lightning-textarea");
        const post = {
            post: userPost.value,
            postedBy: this.userId
        }
        addPost({ payload: JSON.stringify(post) }).then(response => {
            this.fetchPosts();
        }).catch(error => {
            console.error('Error in creating post' + error);
        });
        userPost.value = "";
    }
    // Fetch Posts
    async fetchPosts() {
        try {
            const posts = await getPosts();
            if (posts && posts.length > 0) {
                this.ifPostsAreAvailable = true;
                let updatedPosts = [];
                for(let post of posts) {
                    post.user = (await getUser({userId: post.PostedBy__c}))[0];
                    post.likes = await getLikes({ postId: post.Id });
                    post.isLiked = typeof (post.likes.find((l) => l.LikedBy__c === this.userId)) !== 'undefined';
                    post.likeLength = post.likes.length;
                    updatedPosts.push(post);
                }
                console.log(updatedPosts);
                this.posts = updatedPosts;
            } else {
                this.ifPostsAreAvailable = false;
            }
        } catch(error) {
            
            console.error('Error in fetching post' + error);
        }
    }




}