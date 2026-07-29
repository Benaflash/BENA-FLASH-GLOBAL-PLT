import React, { useState, useEffect } from "react";
import { cachedAccessToken } from "../lib/firebase";

export const WorkspaceIntegrations: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pickedFile, setPickedFile] = useState<any>(null);

  const fetchClassroom = async () => {
    if (!cachedAccessToken) {
      setError("Please sign in again to get the access token.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://classroom.googleapis.com/v1/courses", {
        headers: { Authorization: `Bearer ${cachedAccessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch courses: " + res.statusText);
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPicker = () => {
    if (!cachedAccessToken) {
      setError("Please sign in again to get the access token.");
      return;
    }
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      (window as any).gapi.load("picker", { callback: createPicker });
    };
    document.body.appendChild(script);
  };

  const createPicker = () => {
    const view = new (window as any).google.picker.DocsView((window as any).google.picker.ViewId.DOCS);
    const picker = new (window as any).google.picker.PickerBuilder()
      .setOAuthToken(cachedAccessToken)
      .addView(view)
      .setCallback((data: any) => {
        if (data.action === (window as any).google.picker.Action.PICKED) {
          setPickedFile(data.docs[0]);
        }
      })
      .build();
    picker.setVisible(true);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="font-bold text-[#0F172A] text-lg">Google Workspace Integrations</h3>
        <p className="text-xs text-slate-500 mt-1">
          Access Google Classroom courses and pick files from Google Drive using Google Picker.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-bold text-slate-800">Google Classroom</h4>
          <button
            onClick={fetchClassroom}
            disabled={loading}
            className="bg-[#0F172A] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load Courses"}
          </button>
          {courses.length > 0 && (
            <ul className="space-y-2 mt-4">
              {courses.map((course) => (
                <li key={course.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                  <span className="font-bold">{course.name}</span>
                  {course.section && <span className="block text-xs text-slate-500">{course.section}</span>}
                </li>
              ))}
            </ul>
          )}
          {courses.length === 0 && !loading && (
            <p className="text-xs text-slate-500">No courses loaded yet.</p>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-slate-800">Google Picker (Drive)</h4>
          <button
            onClick={loadPicker}
            className="bg-[#0F172A] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase"
          >
            Open Picker
          </button>
          {pickedFile && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 mt-4">
              <h5 className="font-bold text-sm">Selected File:</h5>
              <p className="text-xs mt-1"><span className="font-semibold">Name:</span> {pickedFile.name}</p>
              <p className="text-xs mt-1"><span className="font-semibold">URL:</span> <a href={pickedFile.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open File</a></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
