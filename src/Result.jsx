import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const safeNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// 시도명별 1평당 임대료(만원)
const getRentPerPyeong = (sido) => {
  if (sido === '서울특별시') return 10;
  if (sido === '경기도') return 8;
  if ([
    '부산광역시', '대구광역시', '인천광역시',
    '광주광역시', '대전광역시', '울산광역시', '세종특별자치시'
  ].includes(sido)) return 5;
  return 3;
};

// 좌석 규모별 평수
const getPyeongBySeats = (seats) => {
  if (seats === '소형') return 12;
  if (seats === '중형') return 20;
  if (seats === '대형') return 30;
  return 0;
};

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { region, seats, budget, monthlyRevenue } = location.state || {};

  // region 예시: "서울특별시 종로구 낙원동"
  const sido = region ? region.split(' ')[0] : '';
  const rentPerPyeong = getRentPerPyeong(sido);
  const pyeong = getPyeongBySeats(seats);
  // 최소 월 고정비용 = 임대료 + 10%
  const baseFixedCost = rentPerPyeong * pyeong;
  const minMonthlyFixedCost = Math.round(baseFixedCost * 1.1); // 10% 추가

  // 좌석 규모 표시 포맷팅
  const formatSeats = (seatType) => {
    switch(seatType) {
      case "소형":
        return "소형 (1~20석)";
      case "중형":
        return "중형 (21~40석)";
      case "대형":
        return "대형 (41석 이상)";
      default:
        return seatType;
    }
  };
  
  const monthlyRevenueNum = safeNumber(monthlyRevenue);
  const budgetNum = safeNumber(budget);
  // 순 수익 = 예상 월 매출의 20%
  const netProfit = Math.round(monthlyRevenueNum * 0.2);
  const monthsToBreakeven = netProfit > 0 ? Math.ceil(budgetNum / netProfit) : "-";

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="result-container">
      <h2>예상 결과</h2>
      <div className="result-grid">
        <div className="result-item">
          <span className="result-label">선택한 지역</span>
          <span className="result-value">{region}</span>
        </div>
        <div className="result-item">
          <span className="result-label">좌석 규모</span>
          <span className="result-value">{formatSeats(seats)}</span>
        </div>
        <div className="result-item">
          <span className="result-label">초기 투자 비용</span>
          <span className="result-value">{budgetNum.toLocaleString()} 만원</span>
        </div>
        <div className="result-item highlight">
          <span className="result-label">예상 월 매출</span>
          <span className="result-value">{monthlyRevenueNum.toLocaleString()} 만원</span>
        </div>
        <div className="result-item">
          <span className="result-label">최소 월 고정비용</span>
          <span className="result-value">{minMonthlyFixedCost.toLocaleString()} 만원</span>
        </div>
        <div className="result-item">
          <span className="result-label">순 수익</span>
          <span className="result-value">{netProfit.toLocaleString()} 만원</span>
        </div>
      </div>
      <div className="result-item" style={{textAlign:'center', width:'100%', margin:'0 auto', padding:0, border:'none', background:'none'}}>
        <div style={{color:'#888', fontSize:'0.85em', margin:'0.5rem 0 1.5rem 0', textAlign:'center'}}>
          * 순 수익은 예상 월 매출의 20%로 산정된 값입니다. 실제 수익은 매장 운영 상황에 따라 달라질 수 있습니다.
        </div>
      </div>
      <div className="breakeven-container">
        <h3>손익분기점 분석</h3>
        <div className="breakeven-info">
          <div className="breakeven-detail">
            <span className="breakeven-label">예상 손익분기 도달 기간</span>
            <span className="breakeven-value">{monthsToBreakeven}개월</span>
          </div>
          <div className="breakeven-timeline">
            <div className="timeline-marker start">
              <span>시작</span>
              <span className="amount">-{budgetNum.toLocaleString()}만원</span>
            </div>
            <div className="timeline-progress">
              <div className="timeline-line"></div>
              <div className="timeline-months">{monthsToBreakeven}개월 소요</div>
            </div>
            <div className="timeline-marker end">
              <span>손익분기</span>
              <span className="amount">0원</span>
            </div>
          </div>
          <p className="breakeven-description" style={{textAlign:'center', margin:'1.5rem 0 0.5rem 0', color:'#444', fontSize:'1em', fontWeight:400}}>
            월 {netProfit.toLocaleString()}만원의 <b>순 수익</b>으로 약 {monthsToBreakeven}개월 후 초기 투자금 회수가 가능할 것으로 예상됩니다.
          </p>
        </div>
      </div>

      <button onClick={handleBack} className="back-button">
        다시 계산하기
      </button>
    </div>
  );
};

export default Result;