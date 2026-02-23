import { HelpCircle, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { useState } from 'react';

function HelpSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left font-semibold text-gray-800"
      >
        {title}
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {open && <div className="p-4 bg-white text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>}
    </div>
  );
}

const content = {
  en: {
    title: 'Help',
    subtitle: 'How to use each page – read here. If you face any issues, check this page.',
    sections: [
      {
        title: '1. Dashboard',
        body: (
          <>
            <p><strong>What it is:</strong> Your main screen showing counts of Products, Customers, Suppliers, Invoices.</p>
            <p><strong>How to use:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Click any card to go to that page (Products, Customers, etc.)</li>
              <li><strong>Total Revenue:</strong> Total amount from all invoices</li>
              <li><strong>Pending Payment:</strong> Payments yet to be received – use "View Pending" to see them</li>
              <li><strong>Low Stock Alert:</strong> Products with low stock – check via "View Products"</li>
              <li>Admin sees "Create New Invoice"; Salesman/B2B sees "Create New Order"</li>
            </ul>
          </>
        ),
      },
      {
        title: '2. Products',
        body: (
          <>
            <p><strong>What it is:</strong> List of all products – add, edit, delete.</p>
            <p><strong>How to use:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Add Product:</strong> Click "Add Product" → fill Name, SKU, Category, Price, GST Rate, Stock, Min Stock, Unit → Save</li>
              <li><strong>Edit:</strong> Click pencil icon, make changes, Save</li>
              <li><strong>Delete:</strong> Click trash icon and confirm</li>
              <li><strong>Export:</strong> Use Download button to export as CSV or Excel</li>
              <li><strong>Low Stock:</strong> Products with red badge need restocking</li>
              <li><strong>Table:</strong> Last updated (date and time, 12hr AM/PM) is shown for each product.</li>
              <li><strong>Categories tab:</strong> Admin can switch to the "Categories" tab (same page) to add/edit categories. Add categories first before adding products.</li>
            </ul>
          </>
        ),
      },
      {
        title: '3. Categories (tab in Products)',
        body: (
          <>
            <p><strong>What it is:</strong> Categories to organize products. Available as a tab on the Products page. Admin only.</p>
            <p><strong>How to use:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Go to <strong>Products</strong> page → switch to <strong>"Categories"</strong> tab</li>
              <li><strong>Add Category:</strong> "Add Category" → fill Name and Description → Save</li>
              <li><strong>Edit/Delete:</strong> Use pencil or trash icon</li>
              <li><strong>Table:</strong> Created and Last updated (date and time, 12hr AM/PM) are shown for each category.</li>
              <li>These will appear in the Category dropdown when adding/editing Products</li>
            </ul>
          </>
        ),
      },
      {
        title: '4. Customers',
        body: (
          <>
            <p><strong>What it is:</strong> List of customers – add, edit, delete, export.</p>
            <p><strong>How to use:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Add Customer:</strong> "Add Customer" → fill Name, Phone, Email, Address, GSTIN, Credit Limit</li>
              <li>Use avatar button to add profile photo</li>
              <li><strong>Edit/Delete:</strong> Use pencil or trash icon</li>
              <li><strong>Export:</strong> Download as CSV or Excel</li>
              <li><strong>Table:</strong> Created and Last updated (date and time, 12hr AM/PM) are shown for each customer.</li>
              <li>You must select a customer when creating an Invoice or Order</li>
            </ul>
          </>
        ),
      },
      {
        title: '5. Suppliers',
        body: (
          <>
            <p><strong>What it is:</strong> List of suppliers. Admin only.</p>
            <p><strong>How to use:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Add Supplier:</strong> "Add Supplier" → fill Name, Phone, Email, Address, GSTIN → Save</li>
              <li><strong>Edit/Delete:</strong> Use pencil or trash icon</li>
              <li>Will be used when Purchase module is added</li>
            </ul>
          </>
        ),
      },
      {
        title: '6. Orders',
        body: (
          <>
            <p><strong>What it is:</strong> Customer orders – Pending, Approved or Rejected.</p>
            <p><strong>How to use:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Customer/Salesman creates order via <strong>Create Order</strong></li>
              <li><strong>Admin:</strong> Click "Approve" → invoice is created automatically and appears in Invoices</li>
              <li>"Reject" cancels the order</li>
              <li>"View Invoice" shows the created invoice</li>
              <li><strong>Table:</strong> Order date and Approved at show date with time below (12hr AM/PM).</li>
            </ul>
          </>
        ),
      },
      {
        title: '7. Create Order',
        body: (
          <>
            <p><strong>What it is:</strong> Create new order from the Orders page. Opens in a side drawer. Salesman and B2B Customer can use it.</p>
            <p><strong>How to use:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Go to <strong>Orders</strong> page → click <strong>"Create Order"</strong> button (or use "Create New Order" from Dashboard)</li>
              <li>Select customer</li>
              <li>Choose date – the order is saved with that date and the current time (so date and time show correctly in Orders table)</li>
              <li>Select product, enter Quantity and Rate (Rate may auto-fill from product price)</li>
              <li>Use "+" to add more items, "−" to remove</li>
              <li>Click "Create Order" → order is created; Admin must approve it</li>
            </ul>
          </>
        ),
      },
      {
        title: '8. Invoices',
        body: (
          <>
            <p><strong>What it is:</strong> List of all invoices – view, print, mark paid, export. Admin can also create invoices from the Create Invoice tab.</p>
            <p><strong>How to use:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Tabs:</strong> Admin sees "Invoices" and "Create Invoice" tabs. Switch to Create Invoice to create a new bill.</li>
              <li><strong>Filter:</strong> Use All, Pending or Received</li>
              <li><strong>View:</strong> Click invoice to see details</li>
              <li><strong>Print:</strong> Use print icon to print or save as PDF</li>
              <li><strong>Mark as Paid:</strong> On pending invoice click "Mark Paid" → enter Received Date → Confirm. The exact date and time of marking paid are saved and shown under Status (12hr AM/PM).</li>
              <li><strong>Table:</strong> Date, Due Date and Status show date with time below. For Received invoices, the paid date and time appear under the status.</li>
              <li><strong>Export:</strong> Download all invoices as CSV or Excel</li>
            </ul>
          </>
        ),
      },
      {
        title: '9. Create Invoice (tab in Invoices)',
        body: (
          <>
            <p><strong>What it is:</strong> Create invoice directly. Available as a tab on the Invoices page. Admin only.</p>
            <p><strong>How to use:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Go to <strong>Invoices</strong> page → switch to <strong>"Create Invoice"</strong> tab</li>
              <li>Select customer</li>
              <li>Set Invoice Date and Due Date</li>
              <li>Choose GST Rate and GST Type (CGST+SGST or IGST)</li>
              <li>Select product, enter Quantity and Rate</li>
              <li>Use "+" to add more items</li>
              <li>Click "Create Invoice" → invoice is created and print preview appears</li>
              <li>Use Print button to print or save as PDF</li>
            </ul>
          </>
        ),
      },
      {
        title: '10. Reports',
        body: (
          <>
            <p><strong>What it is:</strong> Reports for Revenue, Received, Pending, Top Products, Low Stock.</p>
            <p><strong>How to use:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use filter to choose "All Time", "This Month", "Last Month", etc.</li>
              <li>View Total Revenue, Received, Pending, Invoice count, Average Order Value</li>
              <li>See Top 5 Products by sales</li>
              <li>View Low Stock products list</li>
            </ul>
          </>
        ),
      },
      {
        title: '11. Team Members',
        body: (
          <>
            <p><strong>What it is:</strong> Add/edit Salesmen and other team members. Salesman Performance is available as a tab. Admin only.</p>
            <p><strong>How to use:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Tabs:</strong> Switch between "Team Members" and "Salesman Performance" to manage team or view sales data.</li>
              <li><strong>Add Member:</strong> "Add Member" → fill Name, Mobile, Email, Password, Role (Salesman)</li>
              <li><strong>Assigned Customers:</strong> Select which customers this salesman can see</li>
              <li><strong>Edit/Delete:</strong> Use pencil or trash icon</li>
              <li><strong>Reset Password:</strong> Click member → "Reset Password" to set new password</li>
              <li>You can also upload avatar photo</li>
              <li><strong>Table:</strong> Created and Last updated (date and time, 12hr AM/PM) are shown for each member.</li>
            </ul>
          </>
        ),
      },
      {
        title: '12. Salesman Performance (tab in Team)',
        body: (
          <>
            <p><strong>What it is:</strong> Sales details for each Salesman. Available as a tab on the Team Members page. Admin only.</p>
            <p><strong>How to use:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Go to <strong>Team</strong> page → switch to <strong>"Salesman Performance"</strong> tab</li>
              <li>Set date range using From Date and To Date</li>
              <li>Use search box to find salesman</li>
              <li>List shows Total Sales, Orders, Invoices</li>
              <li>Click a salesman to see order-wise details</li>
            </ul>
          </>
        ),
      },
      {
        title: '13. Settings',
        body: (
          <>
            <p><strong>What it is:</strong> Business info – Logo, GSTIN, Address, etc. This appears on invoices.</p>
            <p><strong>How to use:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Business Logo:</strong> Choose and upload (under 500 KB)</li>
              <li><strong>Business Name, Address, GSTIN, State, State Code:</strong> Fill and Save</li>
              <li>This info will appear on all invoices</li>
            </ul>
          </>
        ),
      },
      {
        title: 'General Tips',
        body: (
          <>
            <p><strong>Session:</strong> Login expires after some time. Log in again when needed.</p>
            <p><strong>Roles:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Company Admin:</strong> Can manage everything – products, invoices, team, settings</li>
              <li><strong>Salesman:</strong> Can view Products, Customers, Orders. Can create orders. Limited to assigned customers</li>
              <li><strong>B2B Customer:</strong> Can view Products, Orders and create orders</li>
            </ul>
            <p><strong>Date & time in tables:</strong> Where dates are shown, the time appears below the date in 12-hour format (e.g. 2:30 PM). Created / Last updated columns appear in Products, Categories, Customers, Orders, Invoices and Team Members where applicable.</p>
            <p><strong>If you face issues:</strong> Re-read this Help page. If problem persists, contact support.</p>
          </>
        ),
      },
    ],
  },
  hi: {
    title: 'सहायता',
    subtitle: 'हर पेज का उपयोग कैसे करें – यहाँ पढ़ें। कोई समस्या हो तो यहाँ से देखें।',
    sections: [
      { title: '1. डैशबोर्ड', body: null },
      { title: '2. उत्पाद (Products)', body: null },
      { title: '3. श्रेणियाँ (Categories)', body: null },
      { title: '4. ग्राहक (Customers)', body: null },
      { title: '5. आपूर्तिकर्ता (Suppliers)', body: null },
      { title: '6. ऑर्डर (Orders)', body: null },
      { title: '7. ऑर्डर बनाएं (Create Order)', body: null },
      { title: '8. इनवॉइस (Invoices)', body: null },
      { title: '9. इनवॉइस बनाएं (Create Invoice)', body: null },
      { title: '10. रिपोर्ट (Reports)', body: null },
      { title: '11. टीम (Team Members)', body: null },
      { title: '12. सॉल्समैन परफॉर्मेंस (tab in Team)', body: null },
      { title: '13. सेटिंग्स (Settings)', body: null },
      { title: 'सामान्य बातें (General Tips)', body: null },
    ],
  },
};

// Hindi content
content.hi.sections[0].body = (
  <>
    <p><strong>क्या है:</strong> आपका मुख्य स्क्रीन जहाँ Products, Customers, Suppliers, Invoices की संख्या दिखती है।</p>
    <p><strong>कैसे इस्तेमाल करें:</strong></p>
    <ul className="list-disc pl-5 space-y-1">
      <li>हर कार्ड पर क्लिक करें → उस पेज पर चले जाएंगे</li>
      <li><strong>Total Revenue:</strong> सभी इनवॉइस का कुल रेवेन्यू</li>
      <li><strong>Pending Payment:</strong> जो पेमेंट अभी मिलना बाकी है – "View Pending" से देखें</li>
      <li><strong>Low Stock Alert:</strong> कम स्टॉक वाले products – "View Products" से चेक करें</li>
      <li>Admin के लिए "Create New Invoice", Salesman/B2B के लिए "Create New Order" बटन</li>
    </ul>
  </>
);
content.hi.sections[1].body = (
  <>
    <p><strong>क्या है:</strong> सभी प्रोडक्ट्स की लिस्ट – add, edit, delete कर सकते हैं।</p>
    <p><strong>कैसे इस्तेमाल करें:</strong></p>
    <ul className="list-disc pl-5 space-y-1">
      <li><strong>Add Product:</strong> "Add Product" → Name, SKU, Category, Price, GST Rate, Stock, Min Stock, Unit भरें</li>
      <li><strong>Edit:</strong> पेंसिल आइकन पर क्लिक करें, बदलाव करें</li>
      <li><strong>Delete:</strong> कचरा आइकन पर क्लिक करें और confirm करें</li>
      <li><strong>Export:</strong> Download बटन से CSV या Excel में डाउनलोड करें</li>
      <li><strong>टेबल:</strong> हर product के लिए Last updated (तारीख और समय, 12hr AM/PM) दिखता है।</li>
      <li><strong>Categories टैब:</strong> Admin "Categories" टैब से categories add/edit कर सकता है। Products जोड़ने से पहले categories जोड़ें।</li>
    </ul>
  </>
);
content.hi.sections[2].body = (
  <>
    <p><strong>क्या है:</strong> Products को organize करने के लिए categories। Products पेज पर टैब के रूप में। सिर्फ Admin देख सकता है।</p>
    <p><strong>कैसे इस्तेमाल करें:</strong></p>
    <ul className="list-disc pl-5 space-y-1">
      <li><strong>Products</strong> पेज पर जाएं → <strong>"Categories"</strong> टैब पर क्लिक करें</li>
      <li><strong>Add Category:</strong> Name और Description भरें → Save</li>
      <li><strong>Edit/Delete:</strong> पेंसिल या कचरा आइकन से करें</li>
      <li><strong>टेबल:</strong> हर category के लिए Created और Last updated (तारीख और समय, 12hr AM/PM) दिखते हैं।</li>
      <li>Products में Add/Edit करते समय Category dropdown में दिखेंगे</li>
    </ul>
  </>
);
content.hi.sections[3].body = (
  <>
    <p><strong>क्या है:</strong> ग्राहकों की लिस्ट – add, edit, delete, export कर सकते हैं।</p>
    <p><strong>कैसे इस्तेमाल करें:</strong></p>
    <ul className="list-disc pl-5 space-y-1">
      <li><strong>Add Customer:</strong> Name, Phone, Email, Address, GSTIN, Credit Limit भरें</li>
      <li>Photo के लिए avatar बटन इस्तेमाल करें</li>
      <li><strong>Edit/Delete:</strong> पेंसिल या कचरा आइकन से करें</li>
      <li><strong>टेबल:</strong> हर customer के लिए Created और Last updated (तारीख और समय, 12hr AM/PM) दिखते हैं।</li>
      <li>इनवॉइस या Order बनाते समय Customer select जरूरी है</li>
    </ul>
  </>
);
content.hi.sections[4].body = (
  <>
    <p><strong>क्या है:</strong> आपूर्तिकर्ताओं की लिस्ट। सिर्फ Admin देख सकता है।</p>
    <p><strong>कैसे इस्तेमाल करें:</strong></p>
    <ul className="list-disc pl-5 space-y-1">
      <li><strong>Add Supplier:</strong> Name, Phone, Email, Address, GSTIN भरें → Save</li>
      <li><strong>Edit/Delete:</strong> पेंसिल या कचरा आइकन से करें</li>
    </ul>
  </>
);
content.hi.sections[5].body = (
  <>
    <p><strong>क्या है:</strong> ग्राहकों के ऑर्डर – Pending, Approved या Rejected स्टेटस के साथ।</p>
    <p><strong>कैसे इस्तेमाल करें:</strong></p>
    <ul className="list-disc pl-5 space-y-1">
      <li>ग्राहक/सॉल्समैन <strong>Create Order</strong> से ऑर्डर देता है</li>
      <li><strong>Admin:</strong> "Approve" पर क्लिक करें → इनवॉइस अपने आप बन जाएगी</li>
      <li>"Reject" से ऑर्डर रद्द हो जाता है</li>
      <li><strong>टेबल:</strong> Order date और Approved at तारीख के नीचे समय (12hr AM/PM) के साथ दिखते हैं।</li>
    </ul>
  </>
);
content.hi.sections[6].body = (
  <>
    <p><strong>क्या है:</strong> Orders पेज से नया ऑर्डर बनाएं। साइड ड्रॉअर में खुलता है। Salesman और B2B Customer भी इस्तेमाल कर सकते हैं।</p>
    <p><strong>कैसे इस्तेमाल करें:</strong></p>
    <ul className="list-disc pl-5 space-y-1">
      <li><strong>Orders</strong> पेज पर जाएं → <strong>"Create Order"</strong> बटन क्लिक करें (या Dashboard से "Create New Order" इस्तेमाल करें)</li>
      <li>Customer select करें, Date चुनें – ऑर्डर उसी तारीख और उस समय के साथ सेव होता है (Orders टेबल में सही date/time दिखता है)</li>
      <li>Product select करें, Quantity और Rate भरें</li>
      <li>"+" से items जोड़ें, "−" से हटाएं</li>
      <li>"Create Order" क्लिक करें → Admin को Approve करना होगा</li>
    </ul>
  </>
);
content.hi.sections[7].body = (
  <>
    <p><strong>क्या है:</strong> सभी इनवॉइस की लिस्ट – देखें, print करें, paid मार्क करें, export करें। Admin Create Invoice टैब से नया बिल भी बना सकता है।</p>
    <p><strong>कैसे इस्तेमाल करें:</strong></p>
    <ul className="list-disc pl-5 space-y-1">
      <li><strong>टैब:</strong> Admin को "Invoices" और "Create Invoice" टैब दिखते हैं। नया बिल बनाने के लिए Create Invoice टैब पर जाएं।</li>
      <li><strong>Filter:</strong> All, Pending या Received से filter करें</li>
      <li><strong>Mark as Paid:</strong> Pending इनवॉइस पर "Mark Paid" → Received Date दें। Paid मार्क करने की सही तारीख और समय Status के नीचे दिखता है (12hr AM/PM)।</li>
      <li><strong>टेबल:</strong> Date, Due Date और Status के नीचे तारीख और समय दिखता है। Received इनवॉइस में paid की तारीख और समय status के नीचे दिखते हैं।</li>
      <li><strong>Export:</strong> CSV या Excel में डाउनलोड करें</li>
    </ul>
  </>
);
content.hi.sections[8].body = (
  <>
    <p><strong>क्या है:</strong> सीधे इनवॉइस बनाना। Invoices पेज पर टैब के रूप में। सिर्फ Admin कर सकता है।</p>
    <p><strong>कैसे इस्तेमाल करें:</strong></p>
    <ul className="list-disc pl-5 space-y-1">
      <li><strong>Invoices</strong> पेज पर जाएं → <strong>"Create Invoice"</strong> टैब पर क्लिक करें</li>
      <li>Customer select करें, Invoice Date और Due Date सेट करें</li>
      <li>GST Rate और GST Type (CGST+SGST या IGST) चुनें</li>
      <li>Product select करें, Quantity और Rate भरें</li>
      <li>"Create Invoice" क्लिक करें → print preview दिखेगा</li>
    </ul>
  </>
);
content.hi.sections[9].body = (
  <>
    <p><strong>क्या है:</strong> Revenue, Received, Pending, Top Products, Low Stock की रिपोर्ट।</p>
    <p><strong>कैसे इस्तेमाल करें:</strong></p>
    <ul className="list-disc pl-5 space-y-1">
      <li>फिल्टर से "All Time", "This Month", "Last Month" चुनें</li>
      <li>Total Revenue, Received, Pending, Top Products, Low Stock देखें</li>
    </ul>
  </>
);
content.hi.sections[10].body = (
  <>
    <p><strong>क्या है:</strong> Salesman और टीम मेम्बर्स add/edit करना। Salesman Performance टैब में उपलब्ध है। सिर्फ Admin देख सकता है।</p>
    <p><strong>कैसे इस्तेमाल करें:</strong></p>
    <ul className="list-disc pl-5 space-y-1">
      <li><strong>टैब:</strong> "Team Members" और "Salesman Performance" के बीच switch करें – टीम manage करें या sales data देखें।</li>
      <li><strong>Add Member:</strong> Name, Mobile, Email, Password, Role भरें</li>
      <li><strong>Assigned Customers:</strong> Salesman को कौन-कौन से customers दिखाने हैं select करें</li>
      <li><strong>Reset Password:</strong> Member पर क्लिक करके नया पासवर्ड सेट करें</li>
      <li><strong>टेबल:</strong> हर member के लिए Created और Last updated (तारीख और समय, 12hr AM/PM) दिखते हैं।</li>
    </ul>
  </>
);
content.hi.sections[11].body = (
  <>
    <p><strong>क्या है:</strong> हर Salesman के sales का विवरण। Team Members पेज पर टैब के रूप में। सिर्फ Admin देख सकता है।</p>
    <p><strong>कैसे इस्तेमाल करें:</strong></p>
    <ul className="list-disc pl-5 space-y-1">
      <li><strong>Team</strong> पेज पर जाएं → <strong>"Salesman Performance"</strong> टैब पर क्लिक करें</li>
      <li>From Date और To Date से date range चुनें</li>
      <li>Search से salesman ढूंढें, सूची में Total Sales, Orders दिखते हैं</li>
      <li>किसी salesman पर क्लिक करने पर order-wise details दिखते हैं</li>
    </ul>
  </>
);
content.hi.sections[12].body = (
  <>
    <p><strong>क्या है:</strong> व्यापार की जानकारी – Logo, GSTIN, Address। यह इनवॉइस पर दिखता है।</p>
    <p><strong>कैसे इस्तेमाल करें:</strong></p>
    <ul className="list-disc pl-5 space-y-1">
      <li><strong>Business Logo:</strong> upload करें (500 KB से कम)</li>
      <li>Business Name, Address, GSTIN, State, State Code भरें और Save करें</li>
    </ul>
  </>
);
content.hi.sections[13].body = (
  <>
    <p><strong>Session:</strong> कुछ समय बाद login expire हो जाता है। दोबारा login करें।</p>
    <p><strong>रोल:</strong></p>
    <ul className="list-disc pl-5 space-y-1">
      <li><strong>Company Admin:</strong> सब कुछ manage कर सकता है</li>
      <li><strong>Salesman:</strong> Products, Customers, Orders देख सकता है, Order बना सकता है</li>
      <li><strong>B2B Customer:</strong> Products, Orders देख सकता है और Order बना सकता है</li>
    </ul>
    <p><strong>टेबल में तारीख और समय:</strong> जहाँ तारीख दिखती है, उसके नीचे समय 12-hour फॉर्मैट में (जैसे 2:30 PM) दिखता है। Products, Categories, Customers, Orders, Invoices और Team Members में जहाँ लागू हो वहाँ Created / Last updated कॉलम दिखते हैं।</p>
    <p><strong>समस्या आने पर:</strong> इस Help पेज को दोबारा पढ़ें। फिर भी issue हो तो support से संपर्क करें।</p>
  </>
);

export default function Help() {
  const [lang, setLang] = useState('en'); // default English
  const t = content[lang];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <HelpCircle className="text-primary-500 shrink-0" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-600 text-sm">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-gray-500 shrink-0" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {t.sections.map((section, i) => (
          <HelpSection key={i} title={section.title} defaultOpen={i === 0}>
            {section.body}
          </HelpSection>
        ))}
      </div>
    </div>
  );
}
