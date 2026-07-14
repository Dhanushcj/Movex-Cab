import os
from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'MoveX Cab Application - Comprehensive Report', 0, 1, 'C')
        self.set_font('Arial', 'I', 10)
        self.cell(0, 10, 'Detailed Explanation, Workflow, and Features', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 14)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 10, title, 0, 1, 'L', 1)
        self.ln(4)

    def chapter_body(self, body):
        self.set_font('Arial', '', 12)
        # Using multi_cell to handle line breaks properly
        self.multi_cell(0, 8, body)
        self.ln()

def generate_pdf(filename="MoveX_Project_Report.pdf"):
    pdf = PDF()
    pdf.add_page()
    
    # Introduction
    pdf.chapter_title('1. Introduction')
    intro_text = (
        "MoveX is a comprehensive cab booking platform designed to provide seamless mobility solutions. "
        "The system consists of three distinct components: the Customer App for riders, the Driver App for driver partners, "
        "and the Admin Dashboard for operations management.\n\n"
        "This report outlines the complete workflow of the MoveX platform, detailing the technologies used, "
        "core features across its components, and the end-to-end booking process."
    )
    pdf.chapter_body(intro_text)

    # Technologies Used
    pdf.chapter_title('2. Technologies Used')
    tech_text = (
        "The MoveX platform is built using a modern, scalable technology stack:\n\n"
        "1. Frontend (Mobile Apps): React Native with Expo. React Navigation is used for routing, and "
        "Context API for state management. Expo provides native capabilities like location tracking and push notifications.\n"
        "2. Frontend (Admin Panel): React.js (or integrated within the React Native web capabilities).\n"
        "3. Backend API: Node.js and Express.js, providing RESTful endpoints for CRUD operations and business logic.\n"
        "4. Database: MongoDB (with Mongoose ODM) for flexible schema design handling geospatial data and complex relationships.\n"
        "5. Real-time Communication: Socket.io for live driver tracking, ride matching, and instant status updates.\n"
        "6. Authentication: Firebase Authentication (supporting Google Sign-In and Email/Password flows).\n"
        "7. Cloud Hosting: Render for continuous deployment of the Node.js backend API and MongoDB for the database.\n"
        "8. Payment Gateway: Integrated Razorpay/Stripe (or simulated cash/wallet workflows) for secure transactions."
    )
    pdf.chapter_body(tech_text)

    # Core Features
    pdf.chapter_title('3. Core Features')
    features_text = (
        "Customer App Features:\n"
        "- Ride Booking: Intuitive interface to select pickup and drop locations using maps.\n"
        "- Fare Estimation: Real-time calculation of fares across different vehicle categories (Bike, Auto, Mini, Sedan, SUV).\n"
        "- Subscription Passes: Tiered pass system allowing users to buy passes (e.g., Bronze, Silver, Gold, Platinum, Diamond) "
        "for discounted or free rides up to a certain limit.\n"
        "- Live Tracking: Real-time visualization of the assigned driver approaching the pickup location on the map.\n"
        "- Digital Wallet: In-app wallet for seamless top-ups and cashless payments.\n"
        "- Multilingual Support: English and regional language translations.\n\n"
        "Driver App Features:\n"
        "- Online/Offline Toggle: Drivers can dictate their availability in real-time.\n"
        "- Ride Acceptance: Incoming ride requests via push notifications and live socket events, with a countdown timer.\n"
        "- Earnings Dashboard: Real-time tracking of completed rides and accumulated earnings.\n"
        "- Document Verification: Secure upload of KYC documents (Aadhaar, License, RC, Insurance).\n\n"
        "Admin Dashboard Features:\n"
        "- User & Driver Management: Full CRUD operations to manage profiles, verify driver documents, and approve drivers.\n"
        "- Dynamic Configuration: Ability to configure base fares, per-km rates, and commission percentages dynamically.\n"
        "- Pass Management: Create and update subscription pass tiers with customized benefits."
    )
    pdf.chapter_body(features_text)
    
    # Complete Workflow
    pdf.chapter_title('4. Complete Workflow')
    workflow_text = (
        "The end-to-end ride booking workflow is seamlessly managed through a combination of REST APIs and WebSockets:\n\n"
        "Step 1: Registration and Authentication\n"
        "Users and Drivers register via Firebase Auth. Drivers submit their documents, which go into a 'pending' state "
        "until verified by the Admin. Once approved, the driver can toggle their status to 'Online', which establishes a Socket.io connection.\n\n"
        "Step 2: Ride Request\n"
        "A Customer enters their destination. The backend calculates fare estimates based on distance and applies active pass discounts. "
        "Upon confirming the booking, the backend queries MongoDB using Geospatial queries ($geoWithin) to find online, approved drivers "
        "within a specific radius matching the vehicle type.\n\n"
        "Step 3: Driver Matching & Dispatch (Sequential Dispatch)\n"
        "The matching engine sorts available drivers by distance and dispatches the request to them sequentially via Socket.io. "
        "If a driver accepts, the ride status transitions to 'accepted'. If they decline or the request times out, it moves to the next closest driver.\n\n"
        "Step 4: Active Trip & Live Tracking\n"
        "The driver receives a 4-digit OTP from the customer to start the ride. During the trip, the driver's app continually emits location updates "
        "via Socket.io, allowing the customer to track the vehicle live on their map.\n\n"
        "Step 5: Completion and Payment\n"
        "Upon reaching the destination, the driver marks the ride as complete. Fare calculations finalize (accounting for wallet balances or cash). "
        "Both parties are then prompted to submit a rating and review, concluding the workflow."
    )
    pdf.chapter_body(workflow_text)

    # Conclusion
    pdf.chapter_title('5. Conclusion')
    conclusion_text = (
        "The MoveX Cab application represents a robust, highly scalable ride-hailing solution. By leveraging Node.js for high-concurrency APIs, "
        "MongoDB for rapid geospatial queries, and Socket.io for low-latency live tracking, the architecture guarantees a smooth and responsive "
        "experience for both customers and drivers."
    )
    pdf.chapter_body(conclusion_text)

    # Save PDF
    pdf.output(filename)
    print(f"Successfully generated {filename}")

if __name__ == "__main__":
    generate_pdf()
