import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { AuthService } from 'src/app/services/auth.service';
import { BudgetService } from 'src/app/services/budget.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  currentId : any
  userData: any;
  profileForm: FormGroup;
  selectedImage: File;
  imagePath : string;

  expenseSuggestion : any = [];
  transactionData : any;
  constructor(private formBuilder: FormBuilder, 
    private localStorageService : LocalStorageService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router : Router) {

    }

  ngOnInit(): void {


    this.profileForm = this.formBuilder.group({
      firstname: ['', Validators.required],
      lastname: [''],
      username: ['', Validators.pattern(/^\d{10}$/)], // Assuming a 10-digit username
      image: [''],
      otp: [''],
      phone: [''],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/),
        ],
      ],
      password: [
        '',
        [
          // Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\-]+$/),
        ],
      ],
      confirmpassword: [''],
      date_of_birth : [''],
      gender : [''],

      accountDeactivation : [false],
      enableOfflineAccess : [false],
      emailNotification : [true],

    }, { validator: this.passwordMatchValidator() });




    this.activatedRoute.params.subscribe((params: Params) => {
      // this.type = params['type']; 
      this.currentId = parseInt(params['id_user']);
    });

    // if edit mode get the details
    this.getDetails();
  }


  getDetails(){
    if(this.currentId){
      this.authService.getUserDetails(this.currentId).subscribe(
        (response) => {
          if (response) {

            this.userData = response.userData;
            this.imagePath = response.imagePath;
  
            this.profileForm.patchValue({
              firstname: this.userData.firstname,
              lastname: this.userData.lastname,
              username: this.userData.username,
              gender: this.userData.gender,
              // image: this.userData.image,
              // otp: this.userData.otp,
              phone: this.userData.phone,
              email: this.userData.email,
              accountDeactivation : (this.userData.active == "1")?true: false,
              enableOfflineAccess : (this.userData.offline_access== "1")?true: false,
              emailNotification : (this.userData.email_notification == "1")?true: false,
  
            });
          }
        },(error) => { },
      );
    }
    
  }

  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImageBase64 : any;

  onFileChange(event: any) {
    this.imageChangedEvent = event;
  }
  
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.blob;

    // If you want to convert the blob to base64 for display purposes
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        this.croppedImageBase64 = reader.result as string;
      }
    };
    //@ts-ignore
    reader.readAsDataURL(event.blob);
  }
  imageLoaded() {
      // show cropper
  }
  cropperReady() {
      // cropper ready
  }
  loadImageFailed() {
      // show message
  }

  onSubmit() {
    if (this.profileForm.valid) {

      const formData = new FormData();
      formData.append('firstname', this.profileForm.value.firstname);
      formData.append('lastname', this.profileForm.value.lastname);
      formData.append('date_of_birth', this.profileForm.value.date_of_birth);
      formData.append('gender', this.profileForm.value.gender);

      formData.append('accountDeactivation', (!!this.profileForm.value.accountDeactivation)?'1':'0');
      formData.append('enableOfflineAccess', (!!this.profileForm.value.enableOfflineAccess)?'1':'0');
      formData.append('emailNotification', (!!this.profileForm.value.emailNotification)?'1':'0');

      formData.append('otp', this.profileForm.value.otp);
      formData.append('phone', this.profileForm.value.phone);
      formData.append('id', this.currentId);
      

      if(this.croppedImage){
        formData.append('image', this.croppedImage, 'profile-image.png'); 
      }

      this.authService.saveUserDetails(formData).subscribe(
        (response) => {
          this.localStorageService.setItem("userInfo", response);
          this.userData = response;
          this.imagePath = response.imagePath;

          //INFO : After Upload hide Image selection
          this.croppedImageBase64 = false;
          this.imageChangedEvent = null;
          Swal.fire({
            icon: 'success',
            title: 'User Details',
            text: 'User Details Updated',
            showConfirmButton: false,
            timer: 1500
          });
          // this.router.navigateByUrl('/profile');

        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'User Details',
            text: 'Details Update Failed!',
            showConfirmButton: false,
            timer: 1500
          });
        }
      );
    }
  }

  changeAccountDeactivation(event : any){
    if(event.target.value){
      // Ask for confirmation
      Swal.fire({
        title: 'Are you sure?',
        text: 'Want to Deactivate your Account',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Deactivate'
      }).then((result) => {
        
        this.profileForm.patchValue({
          accountDeactivation : false,
        });
      });
      
    }
   
  }


  passwordMatchValidator(): any {
    return (formGroup: FormGroup): ValidationErrors | null => {
      const password = formGroup.get('password')?.value;
      const confirmpassword = formGroup.get('confirmpassword')?.value;

      if (password && confirmpassword && password !== confirmpassword) {
        return { passwordMismatch: true };
      } else {
        return null;
      }
    };
  }
}
