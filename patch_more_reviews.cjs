const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

const oldReviews = `[
                {
                  name: "Arjun Verma",
                  role: "Powerlifter",
                  text: "The equipment at Jai Balaji is unmatched. The environment pushes you to your absolute limits.",
                  status: "Member",
                  rating: 5
                },
                {
                  name: "Priya Sharma",
                  role: "Fitness Enthusiast",
                  text: "Love the AI features! The smart planner completely changed my workout routine.",
                  status: "Member",
                  rating: 5
                },
                {
                  name: "Vikas Patel",
                  role: "CrossFit Athlete",
                  text: "The community here is incredible. Professional coaches and state-of-the-art facilities.",
                  status: "Past Member",
                  rating: 4
                },
                {
                  name: "Neha Gupta",
                  role: "Yoga Practitioner",
                  text: "Best gym experience I've had. The smart AI diet recommendations are spot on.",
                  status: "Member",
                  rating: 5
                }
              ]`;

const newReviews = `[
                {
                  name: "Arjun Verma",
                  gym_status: "Member",
                  review_text: "The equipment at Jai Balaji is unmatched. The environment pushes you to your absolute limits. Best gym in town without a doubt.",
                  rating: 5
                },
                {
                  name: "Priya Sharma",
                  gym_status: "Member",
                  review_text: "Love the AI features! The smart planner completely changed my workout routine. Seeing progress faster than ever.",
                  rating: 5
                },
                {
                  name: "Vikas Patel",
                  gym_status: "Past Member",
                  review_text: "The community here is incredible. Professional coaches and state-of-the-art facilities. Wish I hadn't moved out of town!",
                  rating: 4
                },
                {
                  name: "Neha Gupta",
                  gym_status: "Member",
                  review_text: "Best gym experience I've had. The smart AI diet recommendations are spot on and super easy to follow.",
                  rating: 5
                },
                {
                  name: "Karan Singh",
                  gym_status: "Member",
                  review_text: "I booked a few personal training sessions with Sushant. My deadlift has gone up 30kg in a month. Incredible coaching.",
                  rating: 5
                },
                {
                  name: "Sanya Malhotra",
                  gym_status: "Member",
                  review_text: "The functional training area is spacious and well-equipped. Nidhi's classes are tough but totally worth it.",
                  rating: 5
                },
                {
                  name: "Rahul Desai",
                  gym_status: "Non-Member",
                  review_text: "Did a trial day yesterday. The facility is extremely clean and the staff is super welcoming. Definitely signing up.",
                  rating: 4
                },
                {
                  name: "Amit Kumar",
                  gym_status: "Member",
                  review_text: "Value for money is incredible. The 12-month Pro plan with AI tracking is a steal for the results I'm getting.",
                  rating: 5
                }
              ]`;

code = code.split(oldReviews).join(newReviews);
fs.writeFileSync('src/pages/LandingPage.tsx', code);
