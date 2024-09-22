import React, { useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate } from "react-router-dom";
import newRequest from "../../../utils/userRequest";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const SlicUserSignUpPopUp = ({ isVisible, setVisibility }) => {
  
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCloseCreatePopup = () => {
    setVisibility(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await newRequest.post("/users/v1/signup", {
        userLoginID: email,
        userPassword: password,
      });
      // console.log(response?.data);
      navigate("/");
      toast.success(response?.data?.message || "Login Successful");
      setLoading(false);
      handleCloseCreatePopup();
    } catch (error) {
      // console.log(error);
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Something went wrong!"
      );
      setLoading(false);
    }
  };

  return (
    <div>
      {isVisible && (
        <div className="popup-overlay z-50">
          <div className="popup-container h-auto sm:w-[50%] w-full">
            <div
              className="popup-form w-full"
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="relative">
                <div className="fixed top-0 left-0 z-10 flex justify-between w-full px-3 bg-secondary">
                  <h2 className="text-white sm:text-xl text-lg font-body font-semibold">
                    {t("Create Account")}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button
                      className="text-white hover:text-red-600 focus:outline-none"
                      onClick={handleCloseCreatePopup}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="w-full overflow-y-auto">
                {/* username */}
                <div  className={`w-full sm:px-0 px-4 mb-6 mt-6 ${  i18n.language === "ar" ? "text-end" : "text-start" }`}>
                  <label
                    htmlFor="email"
                    className="sm:text-2xl text-secondary text-lg font-sans"
                  >
                    {t("Email")}
                  </label>
                  <div className="flex flex-col gap-6">
                    <input
                      id="email"
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("Enter your Email")}
                      className={`p-2 border rounded-md border-secondary text-lg ${
                        i18n.language === "ar" ? "text-end" : "text-start"
                      }`}
                    />
                  </div>

                  <div className={`mt-6 ${  i18n.language === "ar" ? "text-end" : "text-start" }`}
                  >
                    <label
                      htmlFor="password"
                      className="sm:text-2xl text-secondary text-lg font-sans"
                    >
                      {t("Password")}
                    </label>
                    <div className="flex flex-col gap-6">
                      <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("Enter your password")}
                        className={`p-2 border rounded-md border-secondary text-lg ${
                          i18n.language === "ar" ? "text-end" : "text-start"
                        }`}
                      />
                      <Button
                        variant="contained"
                        type="submit"
                        style={{
                          backgroundColor: "#1D2F90",
                          color: "#ffffff",
                          padding: "10px",
                        }}
                        disabled={loading}
                        className="w-full bg-[#B6BAD6] border-b-2 border-[#350F9F] hover:bg-[#9699b1] mb-6 text-white font-medium font-body text-xl rounded-md px-5 py-2"
                        endIcon={
                          loading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            <SendIcon />
                          )
                        }
                      >
                        {t("Sign up")}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlicUserSignUpPopUp;
