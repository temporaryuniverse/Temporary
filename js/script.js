// Wait until page loads
document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("bg-video");

    // Start the video muted (this is allowed in browsers)
    video.muted = true;
    video.play().catch((err) => {
        console.log("Autoplay failed:", err);
    });

    // When user clicks anywhere on the page → unmute video
    document.body.addEventListener("click", function () {
        if (video.muted) {
            video.muted = false;
            video.play().catch((err) => {
                console.log("Play after unmute failed:", err);
            });
        }
    });
});
