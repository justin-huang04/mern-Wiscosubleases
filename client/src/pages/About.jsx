import React from "react";

export default function About() {
  return (
    <div className="py-20 px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-slate-800">
        About WiscoSubleases
      </h1>
      <p className="mb-4 text-slate-700">
        Subleasing can be a hassle, often complicated by less-than-ideal
        platforms that don't cater specifically to students' needs.
        WiscoSubleases aims to make the necessary process of subleasing easier.
        Dedicated to UW Madison students, our platform serves as the central hub
        for finding and posting subleases on campus. Whether you're looking to
        find a new spot for the semester or need someone to take over your
        lease, WiscoSubleases simplifies the process, making it easier, faster,
        and more reliable.
      </p>
      <h1 className="text-3xl font-bold mb-4 text-slate-800">Meet the team</h1>
      <p className="mb-4 text-slate-700">
        Wiscosubleases was developed and is maintained by Justin Huang - A third
        year computer science/data science student who was inspired to build
        this website after he had his own problems with subleasing.
      </p>
      <h1 className="text-2xl font-bold mb-4 text-slate-800">
        Feel free to reach out!
      </h1>
      <p className="mb-4 text-slate-700">Email: Justinhuang773@gmail.com</p>
      <p className="mb-4 text-slate-700">
        LinkedIn:{" "}
        <a
          href="https://www.linkedin.com/in/justin-huang-4a626a262"
          style={{ color: "blue" }}
        >
          here
        </a>
      </p>
    </div>
  );
}
