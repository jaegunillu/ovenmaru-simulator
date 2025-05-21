import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';

function cleanDongName(name) {
  // 예: 창신3동, 동선동4가 → 창신동, 동선동
  return name.replace(/([0-9]+가?|[0-9]+)$/g, '').replace(/\s+/g, '').replace(/동동/g, '동').trim();
}

const Simulator = () => {
  const navigate = useNavigate();
  const [regionData, setRegionData] = useState([]); // 전체 엑셀 데이터
  const [sidoList, setSidoList] = useState([]); // 시도명 리스트
  const [sigunguList, setSigunguList] = useState([]); // 시군구명 리스트
  const [dongList, setDongList] = useState([]); // 읍면동명 리스트
  const [sido, setSido] = useState("");
  const [sigungu, setSigungu] = useState("");
  const [dong, setDong] = useState("");
  const [seats, setSeats] = useState("");
  const [budget, setBudget] = useState(1000);

  // 엑셀 파일 fetch 및 파싱
  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/region_data.xlsx')
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setRegionData(jsonData);
        // 시도명 리스트 추출
        const sidos = Array.from(new Set(jsonData.map(row => row['시도명'])));
        setSidoList(sidos);
      });
  }, []);

  // 시도 선택 시 시군구명 리스트 추출
  useEffect(() => {
    if (!sido) {
      setSigunguList([]);
      setSigungu("");
      setDongList([]);
      setDong("");
      return;
    }
    const filtered = regionData.filter(row => row['시도명'] === sido);
    const sigungus = Array.from(new Set(filtered.map(row => row['시군구명'])));
    setSigunguList(sigungus);
    setSigungu("");
    setDongList([]);
    setDong("");
  }, [sido, regionData]);

  // 시군구 선택 시 읍면동명 리스트 추출 및 정제
  useEffect(() => {
    if (!sido || !sigungu) {
      setDongList([]);
      setDong("");
      return;
    }
    const filtered = regionData.filter(row => row['시도명'] === sido && row['시군구명'] === sigungu);
    // 동 이름 정제
    const dongs = Array.from(new Set(filtered.map(row => cleanDongName(row['읍면동명']))));
    setDongList(dongs);
    setDong("");
  }, [sido, sigungu, regionData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // 선택된 지역의 매출액 데이터 찾기 (trim으로 공백까지 제거)
    const selectedRegionData = regionData.find(
      row =>
        row['시도명'] === sido &&
        row['시군구명'] === sigungu &&
        (cleanDongName(row['읍면동명']) || '').trim() === (dong || '').trim()
    );
    // 디버깅용 로그: 선택된 row와 key 목록 출력
    if (selectedRegionData) {
      console.log('선택된 row:', selectedRegionData);
      console.log('row의 key 목록:', Object.keys(selectedRegionData));
    } else {
      console.log('선택된 row 없음');
    }
    let monthlyRevenue = 0;
    if (selectedRegionData) {
      const rawValue =
        selectedRegionData['치킨/닭강정 평균 월매출액(만원)'] ||
        selectedRegionData['치킨/닭강정 평균 월매출액(만원) '] ||
        0;
      monthlyRevenue = Number(String(rawValue).replace(/,/g, ''));
    }
    // 지역 정보는 "시도 시군구 동" 형태로 전달
    const region = `${sido} ${sigungu} ${dong}`;
    navigate("/result", {
      state: { region, seats, budget, monthlyRevenue },
    });
  };

  return (
    <div className="simulator-container">
      <h2>예상 매출 시뮬레이터</h2>
      <form onSubmit={handleSubmit}>
        {/* 시도명 드롭다운 */}
        <div className="form-group">
          <label>시도명</label>
          <select value={sido} onChange={e => setSido(e.target.value)}>
            <option value="">선택해주세요</option>
            {sidoList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {/* 시군구명 드롭다운 */}
        <div className="form-group">
          <label>시군구명</label>
          <select value={sigungu} onChange={e => setSigungu(e.target.value)} disabled={!sido}>
            <option value="">선택해주세요</option>
            {sigunguList.map(sg => <option key={sg} value={sg}>{sg}</option>)}
          </select>
        </div>
        {/* 읍면동명 드롭다운 */}
        <div className="form-group">
          <label>읍면동명</label>
          <select value={dong} onChange={e => setDong(e.target.value)} disabled={!sigungu}>
            <option value="">선택해주세요</option>
            {dongList.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        {/* 좌석 규모 */}
        <div className="form-group">
          <label>좌석 규모</label>
          <select value={seats} onChange={(e) => setSeats(e.target.value)}>
            <option value="">선택해주세요</option>
            <option value="소형">소형 (1~20석)</option>
            <option value="중형">중형 (21~40석)</option>
            <option value="대형">대형 (41석 이상)</option>
          </select>
        </div>
        {/* 보유 예산 */}
        <div className="form-group">
          <label>보유 예산</label>
          <input
            type="range"
            min="500"
            max="5000"
            step="100"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
          <span className="budget-display">{budget.toLocaleString()} 만원</span>
        </div>
        <button type="submit" disabled={!sido || !sigungu || !dong}>결과 확인하기</button>
      </form>
    </div>
  );
};

export default Simulator;