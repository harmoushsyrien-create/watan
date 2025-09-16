"use client";
import React from "react";

import { useRouter } from "next/router";
import { Container } from "@mui/material";
import SectionTitle from "@/components/ui/SectionTitle";
import Types from "@/components/layout/Types";
import OralQuestions from "@/components/ui/OralQuestions";

const TypesPage = ({ qType }) => {
  const router = useRouter();
  if (typeof window !== "undefined") {
    if (!router.isReady) return <div>تحميل...</div>;
  }

  const titleObj = getTitle(qType);
  return (
      <Container className="section" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }} maxWidth="sm">
        <SectionTitle title={titleObj.title} subTitle={titleObj.description} />
        {renderComponent(qType)}
      </Container>
  );
};

const renderComponent = (qType) => {
  switch (qType) {
    case "nTeoria":
      return <Types />;
    case "cTeoria":
      return <Types isNormal={false} />;
    case "oral":
      return <div>مكون شفوي</div>;
    case "training":
      return <div>مكون تدريبي</div>;
    default:
      return null;
  }
};

const getTitle = (qType) =>
  ({
    nTeoria: {
      title: "أسئلة التؤوريا",
      description:
        "هذه هي الأسئلة الأساسية للتؤوريا، تغطي جميع الجوانب النظرية المطلوبة للحصول على الرخصة في فلسطين.",
    },
    cTeoria: {
      title: "أسئلة التؤوريا الاستكمالية",
      description:
        "اختر نوع الرخصة لدراسة الأسئلة الاستكمالية الخاصة بها مع تركيز على امتحان النظري.",
    },
    oral: {
      title: "أسئلة التؤوريا الشفوية",
      description:
        "الأسئلة الشفوية للتؤوريا تركز على التفاعل الفوري وفهم المفاهيم النظرية بشكل عملي.",
    },
    training: {
      title: "أسئلة تدريب سياقة وإدارة مهنية",
      description:
        "أسئلة تدريب سياقة وإدارة مهنية تغطي مهارات القيادة والإدارة في المواقف المهنية.",
    },
  }[qType] || { title: "", description: "" });

export async function getStaticPaths() {
  return {
    paths: [
      { params: { qType: "nTeoria" } },
      { params: { qType: "cTeoria" } },
      { params: { qType: "oral" } },
      { params: { qType: "training" } },
    ],
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {
      qType: params.qType,
    },
  };
}

export default TypesPage;
