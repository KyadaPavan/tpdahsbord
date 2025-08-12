import { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import {
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle,
  Circle,
  FileText,
  Target,
  Briefcase,
  Download,
} from "lucide-react";
import ContractUpdateModal from "./ContractUpdateModal";
import ImageZoom from "./ImageZoom";

const ContractData = ({ contract, canUpdate, showToast, isAdmin }) => {
  const [modalOpen, setModalOpen] = useState(false);
  // For document preview modal
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docUrl, setDocUrl] = useState("");
  const [docType, setDocType] = useState("");
  const [currentContract, setCurrentContract] = useState(
    contract || {
      project_name: "E-commerce Platform Development",
      contract_unique_id: "C69491",
      contract_acceptance_status: {
        status: true,
        contract_enum_name: "Accepted",
      },
      project_completed_status: false,
      trade_type: "Development",
      services: "Full Stack Development",
      project_amount: "125000",
      contract_created: "2024-01-15",
      project_deadline: "2024-03-15",
      project_description:
        "Build a comprehensive e-commerce platform with user authentication, product catalog, shopping cart, payment integration, and admin dashboard. The platform should be responsive and optimized for both desktop and mobile devices.",
      project_milestone_timeline: {
        invitation_accept_by_user: true,
        payment_made_to_trustopay: true,
        seller_started_working: true,
        seller_delivered_project: false,
        buyer_confirms_delivery: false,
        payment_released: false,
      },
      milestone: {
        _id: "67c5ae92fe644882fa937091",
        contract_i: "67c5ae92fe644882fa937090",
        milestone: [
          {
            title: "jainish",
            milestone_start_date: "2025-01-01T17:40:47Z",
            milestone_due_date: "2026-01-22T15:23:00Z",
            milestone_amount: 100,
            description:
              "Donec diam neque, vestibulum eget, vulputate ut, ultrices vel, augue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec pharetra, magna vestibulum aliquet ultrices, erat tortor sollicitudin mi, sit amet lobortis sapien sapien non mi. Integer ac neque.",
            delivered_by_seller: false,
            delivery_confirmed_by_buyer: false,
            payment_released: false,
            payment_released_date: null,
          },
          {
            title: "Rev",
            milestone_start_date: "2025-01-01T17:40:47Z",
            milestone_due_date: "2026-02-22T15:23:00Z",
            milestone_amount: 100,
            description:
              "Donec diam neque, vestibulum eget, vulputate ut, ultrices vel, augue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec pharetra, magna vestibulum aliquet ultrices, erat tortor sollicitudin mi, sit amet lobortis sapien sapien non mi. Integer ac neque.",
            delivered_by_seller: false,
            delivery_confirmed_by_buyer: false,
            payment_released: false,
            payment_released_date: null,
          },
          {
            title: "Rev",
            milestone_start_date: "2025-01-01T17:40:47Z",
            milestone_due_date: "2026-03-22T15:23:00Z",
            milestone_amount: 100,
            description:
              "Donec diam neque, vestibulum eget, vulputate ut, ultrices vel, augue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec pharetra, magna vestibulum aliquet ultrices, erat tortor sollicitudin mi, sit amet lobortis sapien sapien non mi. Integer ac neque.",
            delivered_by_seller: false,
            delivery_confirmed_by_buyer: false,
            payment_released: false,
            payment_released_date: null,
          },
          {
            title: "Rev",
            milestone_start_date: "2025-01-01T17:40:47Z",
            milestone_due_date: "2025-01-22T15:23:00Z",
            milestone_amount: 100,
            description:
              "Donec diam neque, vestibulum eget, vulputate ut, ultrices vel, augue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec pharetra, magna vestibulum aliquet ultrices, erat tortor sollicitudin mi, sit amet lobortis sapien sapien non mi. Integer ac neque.",
            delivered_by_seller: false,
            delivery_confirmed_by_buyer: false,
            payment_released: false,
            payment_released_date: null,
          },
          {
            title: "Rev",
            milestone_start_date: "2025-01-01T17:40:47Z",
            milestone_due_date: "2025-01-22T15:23:00Z",
            milestone_amount: 100,
            description:
              "Donec diam neque, vestibulum eget, vulputate ut, ultrices vel, augue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec pharetra, magna vestibulum aliquet ultrices, erat tortor sollicitudin mi, sit amet lobortis sapien sapien non mi. Integer ac neque.",
            delivered_by_seller: false,
            delivery_confirmed_by_buyer: false,
            payment_released: false,
            payment_released_date: null,
          },
        ],
      },
    }
  );

  const cardRef = useRef(null); // reference to the whole card for PDF

  // Sync currentContract with the prop when it changes
  useEffect(() => {
    if (contract) {
      setCurrentContract(contract);
    }
  }, [contract]);

  if (!currentContract) return null;

  const milestones = currentContract.milestone?.milestone || [];
  const completedMilestones = milestones.filter(
    (m) => m.payment_released
  ).length;
  const totalMilestones = milestones.length;
  const progressPercentage =
    totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  // Documents object from contract (may be undefined)
  const documents = currentContract.milestone?.documents || {};

  // One‑click download handler
  const handleDownload = () => {
    const options = {
      margin: 0.3,
      filename: `${currentContract.contract_unique_id}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(options).from(cardRef.current).save();
  };

  return (
    <>
      <div
        ref={cardRef}
        className="relative max-w-4xl mx-auto bg-white rounded-2xl shadow-[0_4px_24px_rgba(59,21,138,0.08)] border border-gray-100"
      >
        {/* Header Section */}
        <div className="relative p-8 bg-[#ede7f6] border-b border-gray-100 rounded-t-2xl">
          {/* Action Buttons */}
          {canUpdate && (
            <div className="absolute flex gap-2 top-8 right-8">
              {/* Update Contract */}
              <button
                className="px-6 py-2.5 bg-[#3b158a] text-white font-semibold rounded-lg hover:bg-[#2d1069] transition-colors duration-200"
                onClick={() => setModalOpen(true)}
              >
                Update Contract
              </button>

              {/* Download Contract */}
              <button
                onClick={handleDownload}
                className="px-6 py-2.5 bg-[#ede7f6] text-[#3b158a] font-semibold rounded-lg border border-[#3b158a]/20 hover:bg-[#d1c4e9] transition-colors duration-200 flex items-center gap-2"
              >
                <Download className="w-5 h-5" /> Download
              </button>
            </div>
          )}

          {/* Project Title and ID */}
          <div className="pr-40 mb-6">
            <h1 className="text-2xl font-bold text-[#3b158a] mb-2">
              {currentContract.project_name}
            </h1>
            <p className="font-medium text-gray-600">
              Contract ID: {currentContract.contract_unique_id}
            </p>
          </div>

          {/* Status Pills */}
          <div className="flex flex-wrap gap-4 mb-2">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-lg border ${
                currentContract.contract_acceptance_status?.status
                  ? "bg-[#ede7f6] text-[#3b158a] border-[#3b158a]/20"
                  : "bg-[#3a158a28] text-[#3b158a] border-[#3b158a]/20"
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">
                Contract Status:{" "}
                {currentContract.contract_acceptance_status?.contract_enum_name}
              </span>
            </div>
            <div
              className={`inline-flex items-center px-4 py-2 rounded-lg border ${
                currentContract.project_completed_status
                  ? "bg-[#ede7f6] text-[#3b158a] border-[#3b158a]/20"
                  : "bg-[#3a158a28] text-[#3b158a] border-[#3b158a]/20"
              }`}
            >
              <Target className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">
                Project Status:{" "}
                {currentContract.project_completed_status
                  ? "Completed"
                  : "In Progress"}
              </span>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-[#ede7f6]/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-[#3b158a]">
                Project Progress
              </span>
              <span className="font-bold text-[#3b158a] text-lg">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full h-3 bg-[#3a158a28] rounded-full">
              <div
                className="bg-[#3b158a] h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-gray-700">
              <span>
                {completedMilestones} of {totalMilestones} milestones completed
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Information Grid */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
            <div className="p-6 transition-shadow duration-200 bg-white border border-gray-100 rounded-xl hover:shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-[#ede7f6] rounded-lg">
                  <Briefcase className="w-5 h-5 text-[#3b158a]" />
                </div>
                <span className="ml-3 text-base font-semibold text-gray-700">
                  Service Details
                </span>
              </div>
              <h4 className="font-semibold text-[#3b158a] text-lg mb-1">
                {currentContract.services}
              </h4>
              {/* <p className="text-base text-gray-600">
                {currentContract.trade_type}
              </p> */}
              <p className="text-base text-gray-600">
                <span className="mr-1 text-base font-semibold text-gray-700">
                  Buyer:
                </span>
                {currentContract.buyer_username}
              </p>
              <p className="text-base text-gray-600">
                <span className="mr-1 text-base font-semibold text-gray-700">
                  Seller:
                </span>
                {currentContract.seller_username}
              </p>
            </div>

            <div className="p-6 transition-shadow duration-200 bg-white border border-gray-100 rounded-xl hover:shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-[#ede7f6] rounded-lg">
                  <IndianRupee className="w-5 h-5 text-[#3b158a]" />
                </div>
                <span className="ml-3 text-base font-semibold text-gray-700">
                  Project Value
                </span>
              </div>
              <h4 className="font-semibold text-[#3b158a] text-2xl">
                ₹{currentContract.project_amount}
              </h4>
            </div>

            <div className="p-6 transition-shadow duration-200 bg-white border border-gray-100 rounded-xl hover:shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-[#ede7f6] rounded-lg">
                  <Calendar className="w-5 h-5 text-[#3b158a]" />
                </div>
                <span className="ml-3 text-base font-semibold text-gray-700">
                  Timeline
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Created:</span>{" "}
                  {currentContract.contract_created}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Deadline:</span>{" "}
                  {currentContract.project_deadline}
                </p>
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-[#3b158a] mr-3" />
              <h3 className="text-xl font-bold text-[#3b158a]">
                Project Description
              </h3>
            </div>
            <div className="bg-[#ede7f6]/20 rounded-xl p-6 border border-[#ede7f6]">
              <p className="leading-relaxed text-gray-700">
                {currentContract.project_description}
              </p>
            </div>
          </div>

          {/* Milestone Timeline */}
          <div>
            <div className="flex items-center mb-6">
              <Clock className="w-5 h-5 text-[#3b158a] mr-3" />
              <h3 className="text-xl font-bold text-[#3b158a]">
                Milestone Timeline
              </h3>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone, index) => {
                // Determine milestone status based on progression logic
                const previousMilestone =
                  index > 0 ? milestones[index - 1] : null;
                const isCompleted = milestone.payment_released;
                const isInProgress =
                  !isCompleted &&
                  (index === 0 ||
                    (previousMilestone && previousMilestone.payment_released));
                const isNotStarted = !isCompleted && !isInProgress;

                // Check if document exists for this milestone index (as string)
                const docKey = String(index);
                const milestoneDoc = documents[docKey];
                console.log(milestoneDoc);
                return (
                  <div
                    key={index}
                    className={`group relative p-6 rounded-xl border transition-all duration-200 ${
                      isCompleted
                        ? "bg-[#ede7f6]/30 border-[#3b158a]/20 hover:bg-[#ede7f6]/50"
                        : isInProgress
                        ? "bg-[#f5edff] border-[#3b158a] hover:bg-[#ede7f6]"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {/* Timeline connector line */}
                    {index < milestones.length - 1 && (
                      <div
                        className={`absolute left-[38px] top-[60px] w-[2px] h-60 ${
                          isCompleted ? "bg-[#3b158a]" : "bg-[#3b158a]/100"
                        }`}
                      ></div>
                    )}

                    <div className="flex items-start">
                      {/* Status Icon */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 mt-1 ${
                          isCompleted
                            ? "bg-[#3b158a] border-[#3b158a]"
                            : isInProgress
                            ? "bg-[#ede7f6] border-[#3b158a]"
                            : "bg-gray-300 border-gray-300"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : isInProgress ? (
                          <Clock className="w-4 h-4 text-[#3b158a]" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-500" />
                        )}
                      </div>

                      {/* Milestone Details */}
                      <div className="flex-grow ml-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-lg text-[#3b158a]">
                            {milestone.title}
                          </h4>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-[#3b158a] text-lg">
                              ₹{milestone.milestone_amount}
                            </span>
                            <div
                              className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                                isCompleted
                                  ? "bg-green-100 text-green-800"
                                  : isInProgress
                                  ? "bg-[#3b158a] text-[#ede7f6]"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {isCompleted
                                ? "Completed"
                                : isInProgress
                                ? "In Progress"
                                : "Not Started"}
                            </div>
                          </div>
                        </div>

                        <p className="mb-4 leading-relaxed text-gray-600">
                          {milestone.description}
                        </p>

                        <div className="grid grid-cols-3 gap-4 mb-4 text-base">
                          <div>
                            <span className="font-semibold text-gray-700">
                              Start Date:
                            </span>
                            <p className="text-gray-600">
                              {new Date(
                                milestone.milestone_start_date
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">
                              Due Date:
                            </span>
                            <p className="text-gray-600">
                              {new Date(
                                milestone.milestone_due_date
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        {/* Document download/view link if exists */}
                        {milestoneDoc &&
                          milestoneDoc.document_uploaded_delivery &&
                          milestoneDoc.document_key_delivery && (
                            <div className="flex items-center gap-2 mb-4">
                              <button
                                type="button"
                                className="inline-block px-4 py-2 bg-[#3b158a] text-white rounded-lg font-semibold hover:bg-[#2d1069] transition-colors duration-200"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(
                                      `http://13.232.19.60:8081/api/private/s3//file-url/${milestoneDoc.document_key_delivery}`
                                    );
                                    const data = await response.json();
                                    if (
                                      data.success &&
                                      data.data &&
                                      data.data.fileUrl
                                    ) {
                                      setDocUrl(data.data.fileUrl);
                                      // Determine file type (simple check)
                                      if (
                                        data.data.fileUrl.match(/\.(pdf)$/i)
                                      ) {
                                        setDocType("pdf");
                                      } else if (
                                        data.data.fileUrl.match(
                                          /\.(jpg|jpeg|png|gif|webp)$/i
                                        )
                                      ) {
                                        setDocType("image");
                                      } else {
                                        setDocType("");
                                      }
                                      setDocModalOpen(true);
                                    } else {
                                      alert("Failed to fetch document link.");
                                    }
                                  } catch (error) {
                                    alert("Error fetching document link.");
                                  }
                                }}
                              >
                                View Document
                              </button>
                              {isAdmin && (
                                <button
                                  type="button"
                                  className="inline-block px-4 py-2 font-semibold text-white transition-colors duration-200 bg-[#3b158a] rounded-lg hover:bg-[#2d1069] "
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(
                                        `http://13.232.19.60:8081/api/private/s3//file-url/${milestoneDoc.document_key_delivery}`
                                      );
                                      const data = await response.json();
                                      if (
                                        data.success &&
                                        data.data &&
                                        data.data.fileUrl
                                      ) {
                                        window.open(
                                          data.data.fileUrl,
                                          "_blank",
                                          "noopener,noreferrer"
                                        );
                                      } else {
                                        alert("No downloadable file found.");
                                      }
                                    } catch (error) {
                                      alert("Error opening file.");
                                    }
                                  }}
                                >
                                  Download
                                </button>
                              )}
                            </div>
                          )}
                        {/* Document Preview Modal */}
                        {docModalOpen && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
                            <div className="relative w-full max-w-6xl p-6 bg-white rounded-lg shadow-lg">
                              <button
                                className="absolute text-3xl font-bold text-gray-700 -top-3 -right-3 right- hover:text-gray-900"
                                onClick={() => {
                                  setDocModalOpen(false);
                                  setDocUrl("");
                                  setDocType("");
                                }}
                                aria-label="Close"
                              >
                                &times;
                              </button>
                              <div className="flex flex-col items-center">
                                {docType === "pdf" ? (
                                  <iframe
                                    src={docUrl}
                                    title="Document Preview"
                                    className="w-full max-w-6xl h-[100vh] border rounded"
                                  />
                                ) : docType === "image" || docUrl ? (
                                  <>
                                    <ImageZoom
                                      src={docUrl}
                                      alt="Document Preview"
                                    />
                                    {isAdmin && docType === "image" && (
                                      <a
                                        href={docUrl}
                                        download
                                        className="mt-4 px-4 py-2 bg-[#3b158a] text-white rounded-lg font-semibold hover:bg-[#2d1069] transition-colors duration-200"
                                      >
                                        Download Image
                                      </a>
                                    )}
                                  </>
                                ) : (
                                  <div>Loading...</div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Status Indicators */}
                        <div className="flex items-center justify-start gap-4 ">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                milestone.delivered_by_seller
                                  ? "bg-[#3b158a] border-[#3b158a]"
                                  : "bg-white border-gray-300"
                              }`}
                            >
                              {milestone.delivered_by_seller && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="text-base text-gray-700">
                              Delivered by Seller
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                milestone.delivery_confirmed_by_buyer
                                  ? "bg-[#3b158a] border-[#3b158a]"
                                  : "bg-white border-gray-300"
                              }`}
                            >
                              {milestone.delivery_confirmed_by_buyer && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="text-base text-gray-700">
                              Delivery Confirmed by Buyer
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                milestone.payment_released
                                  ? "bg-[#3b158a] border-[#3b158a]"
                                  : "bg-white border-gray-300"
                              }`}
                            >
                              {milestone.payment_released && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-base text-gray-700">
                                Payment Released
                              </span>
                              {milestone.payment_released &&
                                milestone.payment_released_date && (
                                  <span className="text-xs text-gray-500">
                                    {new Date(
                                      milestone.payment_released_date
                                    ).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <ContractUpdateModal
          contract={currentContract}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onUpdated={(updated, toastMsgs) => {
            setCurrentContract(updated);
            setModalOpen(false);
            if (toastMsgs?.length && showToast) showToast(toastMsgs);
          }}
        />
      </div>
    </>
  );
};

export default ContractData;
