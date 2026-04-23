import React from "react";
import { useEffect, useMemo, useState } from "react";
import CountrySelector from "../components/CountrySelector";
import DynamicForm from "../components/DynamicForm";
import PageHeader from "../components/PageHeader";
import DashboardLayout from "../layout/DashboardLayout";
import { fetchCountryQuestions, fetchVisaCountries } from "../services/api";

const createAnswersState = (questions) =>
  questions.reduce((nextAnswers, question) => {
    nextAnswers[question.id] = question.type === "boolean" ? false : "";
    return nextAnswers;
  }, {});

const formatAnswer = (answer) => {
  if (typeof answer === "boolean") {
    return answer ? "Yes" : "No";
  }

  return answer || "Not answered";
};

export default function VisaQuestionFlow() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(1);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCountries = async () => {
      setLoadingCountries(true);
      setError("");

      try {
        const nextCountries = await fetchVisaCountries();

        if (isMounted) {
          setCountries(nextCountries);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message ?? "Unable to load countries.");
          setCountries([]);
        }
      } finally {
        if (isMounted) {
          setLoadingCountries(false);
        }
      }
    };

    loadCountries();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCountryName = useMemo(() => {
    const country = countries.find(
      (item) => (item.id ?? item.country_id ?? "") === selectedCountry,
    );

    return country?.name ?? country?.country ?? "Selected country";
  }, [countries, selectedCountry]);

  const handleCountryChange = (countryId) => {
    setSelectedCountry(countryId);
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setError("");
  };

  const handleLoadQuestions = async () => {
    if (!selectedCountry) {
      setError("Select a country before loading questions.");
      return;
    }

    setLoadingQuestions(true);
    setError("");
    setSubmitted(false);

    try {
      const payload = await fetchCountryQuestions(selectedCountry);
      const nextQuestions = payload.questions;

      setQuestions(nextQuestions);
      setAnswers(createAnswersState(nextQuestions));
      setStep(2);
    } catch (loadError) {
      setQuestions([]);
      setAnswers({});
      setError(
        loadError?.response?.data?.error ??
          loadError?.response?.data?.message ??
          loadError.message ??
          "Unable to load country questions.",
      );
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }));
    setSubmitted(false);
  };

  const handleSubmitAnswers = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const handleBack = () => {
    setStep(1);
    setSubmitted(false);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Visa Question Flow"
        description="Country-specific intake questions rendered from backend configuration."
      />

      <section className="workflow-grid">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Country Selection</h3>
              <p>Questions are requested after a country is selected.</p>
            </div>
            <span className="status-pill status-pill--info">Step {step}</span>
          </div>

          <CountrySelector
            countries={countries}
            error={step === 1 ? error : ""}
            loading={loadingCountries}
            onCountryChange={handleCountryChange}
            selectedCountry={selectedCountry}
          />

          <div className="form-actions">
            <button
              className="primary-button"
              disabled={!selectedCountry || loadingCountries || loadingQuestions}
              onClick={handleLoadQuestions}
              type="button"
            >
              {loadingQuestions ? "Loading Questions..." : "Next"}
            </button>
            {step === 2 ? (
              <button className="secondary-button" onClick={handleBack} type="button">
                Back
              </button>
            ) : null}
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>{step === 2 ? selectedCountryName : "Dynamic Questions"}</h3>
              <p>
                {step === 2
                  ? `${questions.length} question${questions.length === 1 ? "" : "s"} loaded.`
                  : "Select a country to begin."}
              </p>
            </div>
          </div>

          {step === 2 ? (
            <>
              {error ? <p className="form-error">{error}</p> : null}
              <DynamicForm
                answers={answers}
                onAnswerChange={handleAnswerChange}
                onSubmit={handleSubmitAnswers}
                questions={questions}
              />
            </>
          ) : (
            <p className="empty-state">No questions loaded yet.</p>
          )}
        </article>
      </section>

      {submitted ? (
        <section className="panel">
          <div className="panel__header">
            <div>
              <h3>Captured Answers</h3>
              <p>Answers are keyed by Supabase question id.</p>
            </div>
          </div>
          <dl className="detail-list">
            {questions.map((question) => (
              <div key={question.id}>
                <dt>{question.label}</dt>
                <dd>{formatAnswer(answers[question.id])}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </DashboardLayout>
  );
}
