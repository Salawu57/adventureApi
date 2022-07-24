import axios from "axios";
import { showAlert } from "./alert";
const stripe = Stripe('pk_test_51LO98PKgA5MfpJ4TlZz048izPBE7RK5eGvbK8GJQ5AETA46OkSXsGVLbmBZpBXExrSoBasSmUxFkFcLnN6jGUGTU00yCeYeixG');

export const bookTour = async tourId => {

    try{

         //Get checkout session from API

    const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);

    console.log(session)

    //create checkout from  + channel credit card

    await stripe.redirectToCheckout({
        
        sessionId: session.data.session.id
    })


    }catch(err){
    
        showAlert('error', err)

    }
   
};