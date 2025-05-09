import React from "react";

const About = () => {
  return (
    <section className="section features" id="features" aria-label="features">
      <div className="container mx-auto px-4 text-center">
        <p className="section-subtitle font-bold text-gray-700 mb-2">
          —Welcome to E-Waste—
        </p>

        <h2 className=" text-4xl section-title font-bold text-black mb-4">
          Leading the Way in E-Waste Management & Sustainability
        </h2>

        <div className=" mx-auto px-4 py-8">
          <div className="flex flex-col gap-10 items-center justify-between text-left text-black">
            <div className="section-text text-lg font-semibold leading-relaxed whitespace-pre-wrap text-left">
              <p className="font-bold text-black">India’s E-Waste Challenge:</p>
              <ul className="list-disc list-inside text-gray-600">
                <li>Over 1.71 million metric tons of e-waste are generated annually in India.</li>
                <li>Most of it is improperly disposed of, causing severe environmental and health hazards.</li>
                <li>Lack of reliable, certified e-waste collection and recycling centers adds to the crisis.</li>
              </ul>

              <p className="font-bold text-black mt-4">Why E-Waste Was Created:</p>
              <ul className="list-disc list-inside text-gray-600">
                <li>To tackle the growing problem of electronic waste management in India.</li>
                <li>To make e-waste disposal accessible, safe, and hassle-free for individuals and businesses.</li>
                <li>To bridge the gap between consumers and certified e-waste facilities through a powerful digital platform.</li>
              </ul>

              <p className="font-bold text-black mt-4">Environmental Impact:</p>
              <ul className="list-disc list-inside text-gray-600">
                <li>Prevents harmful substances like lead, mercury, and cadmium from polluting soil, water, and air.</li>
                <li>Reduces health risks to informal waste pickers and local communities.</li>
                <li>Promotes a circular economy by recovering valuable metals like gold, silver, copper, and rare earth elements.</li>
                <li>Reduces the demand for new resource extraction through reuse, refurbishing, and recycling.</li>
              </ul>

              <p className="font-bold text-black mt-4">Key Benefits of Using E-Waste:</p>
              <ul className="list-disc list-inside text-gray-600">
                <li>Ensures responsible disposal of outdated and unused electronic devices.</li>
                <li>Helps users contribute to a cleaner, greener environment effortlessly.</li>
                <li>Encourages community participation through awareness campaigns and e-waste collection drives.</li>
                <li>Supports India’s goal of achieving a sustainable waste management system and eco-friendly urban living.</li>
              </ul>

              <p className="font-bold text-black mt-4">Our Vision:</p>
              <ul className="list-disc list-inside text-gray-600">
                <li>To make responsible e-waste disposal a daily habit for every Indian household and business.</li>
                <li>To build an informed, conscious, and active community driving the e-waste management revolution.</li>
                <li>To create a greener, safer, and more sustainable future for coming generations.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
