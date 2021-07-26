import { LightningElement, api, wire, track } from 'lwc';
import getUser from '@salesforce/apex/WorkplaceController.getUser';

export default class User extends LightningElement {

    @api userId;
    @track userName;
    @track userImage;
    @track userRole;
    @track isModalOpen = false;

    @wire(getUser, { userId: '$userId' }) user(data, error) {
        if (data.data) {
            this.userImage = data.data[0].Avataar__c;
            this.userName = data.data[0].Name;
            this.userRole = data.data[0].Role__c;
        } else {
            console.error(error);
        }
    }
    openProfileModal() {
        // to open modal set isModalOpen tarck value as true
        this.isModalOpen = true;
    }
    closeProfileModal() {
        // to close modal set isModalOpen tarck value as false
        this.isModalOpen = false;
    }
}