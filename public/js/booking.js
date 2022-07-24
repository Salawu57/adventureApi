import axios from "axios";
import { showAlert } from "./alert";

// const PAYSTACK_KEY = "pk_live_efdb8266fa86280335cc961ab0bfb1dc371d890c";


const payStakeCheckOut = (email, amount, refNo) => {
  let handler = PaystackPop.setup({
    key: PAYSTACK_KEY,
    email: email,
    amount: amount * 100,
    currency: "NGN",

    ref: refNo,

    callback: function (response) {
      let reference = response.reference;

      alert("Payment complete! Reference: " + reference);

      // btn.textContent = "Book tour now!";
    },
    onClose: function () {

      showAlert("error", "Transaction was not completed, window closed.");

      window.location.replace(`/?tour=5c88fa8cf4afda39709c295a&user=62d340e530df962ff87be77c&price=${amount}`);

      // btn.textContent = "Book tour now!";
    },
  });
  handler.openIframe();
};

export const bookTour = async (tourId) => {
  try {
    const bookings = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(bookings.data.bookings.tour.id);

    const userEmail = bookings.data.bookings.user.email;
    const amt = bookings.data.bookings.tour.price;
    const refNo = bookings.data.bookings.tour.id;

    await payStakeCheckOut(userEmail, amt, refNo);
  } catch (err) {
    console.log(err);
  }
};
