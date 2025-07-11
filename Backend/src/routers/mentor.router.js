import express from 'express';
import {
    getAllMentors,
    getMentorById,
    becomeMentor,
    getMentorReviews,
    addMentorFeedback,
    getAllRegisteredMentors,
    acceptConnectionRequest,
    getConnectedMentees,
    dismissConnectionRequest
} from '../controllers/mentor.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public Routes
router.get('/', getAllMentors);
router.get('/all', getAllRegisteredMentors);
router.get('/:id', getMentorById);

// Protected Routes
router.post('/become', verifyJWT, becomeMentor);
// router.get('/:mentorId/reviews', verifyJWT, getMentorReviews);
// router.post('/:mentorId/feedback', verifyJWT, addMentorFeedback);

// router.get('/:id/reviews', getMentorReviews);
router.post('/:mentorId/reviews', verifyJWT, addMentorFeedback);

// //POST: Add feedback for a mentor (protected route)
router.post('/feedback', verifyJWT, addMentorFeedback);

router.post('/connect/accept', verifyJWT, acceptConnectionRequest);
router.post('/connect/dismiss', verifyJWT, dismissConnectionRequest);
router.get('/:mentorId/connected-mentees', verifyJWT, getConnectedMentees);

export default router;


// mera code

// import express from 'express';
// import {
//     getAllMentors,
//     getMentorById,
//     becomeMentor,
//     getMentorReviews,
//     addMentorFeedback,
//     getAllRegisteredMentors,
//     acceptConnectionRequest,
//     getConnectedMentees,
//     dismissConnectionRequest
// } from '../controllers/mentor.controller.js';
// import { verifyJWT } from '../middlewares/auth.middleware.js';

// const router = express.Router();

// // GET: List mentors with filters (skills, experience, etc.)
// router.get('/', verifyJWT, getAllMentors);

// router.get("/all", getAllRegisteredMentors);
// // GET: Fetch a specific mentor profile by ID (with reviews & mentee details)
// router.get('/:id', getMentorById);

// // POST: Upgrade a mentee to a mentor (protected route)
// router.post('/become', verifyJWT, becomeMentor);

// // PUT: Update mentor-specific details (protected route)
// //router.put('/update', verifyJWT, updateMentorDetails);

// // GET: Get mentor reviews by mentor ID
// router.get('/:id/reviews', getMentorReviews);

// //POST: Add feedback for a mentor (protected route)
// router.post('/feedback', verifyJWT, addMentorFeedback);

// // POST: Submit a review for a mentor
// router.post('/:mentorId/reviews', verifyJWT, addMentorFeedback);


// // router.post("/accept-mentee", acceptMenteeRequest);

// router.get("/:mentorId/connected-mentees", getConnectedMentees);
// router.post("/connect/accept", acceptConnectionRequest);
// router.post("/connect/dismiss", dismissConnectionRequest);



// export default router;
