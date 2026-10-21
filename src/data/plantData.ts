import { ObservationRecord, Plant, SpeciesInfo } from '../types/plant';
import { cleanPlantName, cleanStudentId, extractDriveFileId, parseDateToTimestamp, parseHealthScore } from '../utils/imageHelper';
import locAPhoto from '../assets/images/location_a_real.jpg';
import locBPhoto from '../assets/images/location_b_real.jpg';
import locCPhoto from '../assets/images/location_c_real.jpg';

export const RAW_CSV_DATA = `타임스탬프,학번/이름,나의 식물 ID/위치,측정 일자,식물 키/ 초장,잎의 개수(개),대표 잎의 폭/너비(cm),식물 건강 상태,  오늘의 관찰 일지 & 특이사항  ,  오늘의 식물 사진 업로드  
2026. 9. 14 오전 12:27:30,1118 최인찬,A-01 아글라오네마(흰)(인찬),2026. 9. 14,24.2,6,7.2,4점 - 🙂 양호 (특별한 이상 없이 잘 자라고 있음),없음,https://drive.google.com/open?id=19LrVQSaZoO3QogQ77qiFWfaAFGH9C1Fw
2026. 9. 21 오전 12:42:02,1118 최인찬,A-01 아글라오네마(흰)(인찬),2026. 9. 21,24,6,7.3,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),새순이 돋아남,https://drive.google.com/open?id=1ViZxjqNQlxtPufmJd5oMpIwmzngB6TUg
2026. 9. 27 오후 11:15:59,1118 최인찬,A-01 아글라오네마(흰)(인찬),2026. 9. 28,24.7,6,7.3,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),새순이 돋아남,https://drive.google.com/open?id=1SG47s6cobD5hlTMc82UoWdRIcYY7t7No
2026. 9. 14 오전 12:24:40,1213 성승민,A-02 죽백나무(승민),2026. 9. 14,13.5,69,1.5,4점 - 🙂 양호 (특별한 이상 없이 잘 자라고 있음),상한 부분이나ㅜ망가진 곳이 없음,https://drive.google.com/open?id=1ashAa6aPm26KRwGG58A-SnNul-4kOO7Q
2026. 9. 21 오전 12:43:51,1213 성승민,A-02 죽백나무(승민),2026. 9. 21,10.5,79,2.3,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),없음!,https://drive.google.com/open?id=1_-0hGWOVpBG03Smg_xD3uAmRxMpKGV1N
2026. 9. 27 오후 11:17:15,1213 성승민,A-02 죽백나무(승민),2026. 9. 28,18.4,75,2.8,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),새로함 ㅎ,https://drive.google.com/open?id=1YzJ-ZQsDw1OxguzIzjsNqtJymFDl5hkd
2026. 9. 14 오전 12:23:37,1312 김호연,A-03 죽백나무(호연),2026. 9. 14,1.5,79,1.2,4점 - 🙂 양호 (특별한 이상 없이 잘 자라고 있음),없음,https://drive.google.com/open?id=101JWXTxpYVEXOCVoIRHqfUcmB21eQIYZ
2026. 9. 21 오전 12:45:56,1312 김호연,A-03 죽백나무(호연),2026. 9. 21,14.6,79,2.3,4점 - 🙂 양호 (특별한 이상 없이 잘 자라고 있음),없음,https://drive.google.com/open?id=19rSZZthUl1a4f2EhVr8r7vbZeRCJYpdd
2026. 9. 27 오후 11:19:57,1312 김호연,A-03 죽백나무(호연),2026. 9. 28,15,104,1.8,4점 - 🙂 양호 (특별한 이상 없이 잘 자라고 있음),수가 더 늘었음,https://drive.google.com/open?id=1mN-APtiNA6AU7fa_UGgr-GG5EYKsyMST
2026. 9. 14 오전 12:25:13,1313 서준혁,A-04 홍콩야자(준혁),2026. 9. 14,27.5,81,2,4점 - 🙂 양호 (특별한 이상 없이 잘 자라고 있음),특이사항은 딱히없음.,https://drive.google.com/open?id=1wu9-_ESZCJspjT-IDCYBWIBLADMkJvMi
2026. 9. 21 오전 12:43:35,1313 서준혁,A-04 홍콩야자(준혁),2026. 9. 21,29.8,6,1.2,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),잎이 더 자람,https://drive.google.com/open?id=1ulci6OF3uzESoWu6safHISU7B4rHdlNn
2026. 9. 27 오후 11:14:28,1313 서준혁,A-04 홍콩야자(준혁),2026. 9. 28,29.8,171,8.2,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),입이 더 자람,https://drive.google.com/open?id=1IEp11YHcw0_adq3TPcsQDdcdlpaYxpLQ
2026. 9. 21 오전 12:43:07,1314 조성민,A-05 아글라오네마(붉)(성민),2026. 9. 21,32,12,8,4점 - 🙂 양호 (특별한 이상 없이 잘 자라고 있음),정상,https://drive.google.com/open?id=1qITYtYoQB35mFkHenJGchG_q-occLt14
2026. 9. 27 오후 11:13:34,1314 조성민,A-05 아글라오네마(붉)(성민),2026. 9. 28,32,10,12.5,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),없음,https://drive.google.com/open?id=1F5eyRei0xhZHBqUgupXoWifmdnVoqeNy
2026. 9. 14 오전 12:25:54,3305 전수민,A-06 테이블야자(수민),2026. 9. 14,23,180,2.1,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),없슴!,https://drive.google.com/open?id=1t_Cf1dxtLfiiC2_BWbZNZzJNEX8Mz3Z4
2026. 9. 14 오전 12:28:18,1118 최인찬,B-01 아글라오네마(흰)(인찬),2026. 9. 14,31.5,10,6.5,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),새순이 돋아남,https://drive.google.com/open?id=1LEKlKj41xUvPzi7Eqcedy1aIW2p81T4n
2026. 9. 21 오전 12:48:53,1118 최인찬,B-01 아글라오네마(흰)(인찬),2026. 9. 21,29,10,6.6,4점 - 🙂 양호 (특별한 이상 없이 잘 자라고 있음),없음,https://drive.google.com/open?id=1B_00y5W3DNdXdlNqK0K0IVQ3xtUXMMla
2026. 9. 27 오후 11:01:22,1118 최인찬,B-01 아글라오네마(흰)(인찬),2026. 9. 28,30.6,10,6.6,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),새 잎이 올라오기 시작함,https://drive.google.com/open?id=1vJQDlALorL3kOx-UjZsADuXL_as5mNBf
2026. 9. 14 오전 12:25:58,1213 성승민,B-02 죽백나무(승민),2026. 9. 14,10.5,93,1.8,4점 - 🙂 양호 (특별한 이상 없이 잘 자라고 있음),4개 정도가 덜 자람,https://drive.google.com/open?id=1WgaC2MbB5-URtq25aV8pFrA4frAb7MQZ
2026. 9. 27 오후 11:01:06,1213 성승민,B-02 죽백나무(승민),2026. 9. 21,13.2,73,1.8,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),새롭게 나는 잎 두개가 생김,https://drive.google.com/open?id=15PP8Sgn83JjZgpMfxJenhxz_bdXbq-9e
2026. 9. 27 오후 11:04:15,1213 성승민,B-02 죽백나무(승민),2026. 9. 28,14.5,63,1.8,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),줄기가 길어짐,https://drive.google.com/open?id=1KYijJ-JFEI38KRoPzyMzGb7GrpvEhYIh
2026. 9. 14 오전 12:25:22,1312 김호연,B-03 죽백나무(호연),2026. 9. 14,15.5,79,1.5,4점 - 🙂 양호 (특별한 이상 없이 잘 자라고 있음),없음,https://drive.google.com/open?id=1Fs2D-qzMxRssjM4kV1QDc4DgApMS6H8B
2026. 9. 21 오전 12:51:08,1312 김호연,B-03 죽백나무(호연),2026. 9. 21,16.6,79,1,3점 - 😐 보통 (잎 끝이 살짝 말라 있거나 변화가 적음),검은점이 보임,https://drive.google.com/open?id=1BAaoeRxujhh5TQT9qa5kAOerCFGp3ea3
2026. 9. 27 오후 11:06:08,1312 김호연,B-03 죽백나무(호연),2026. 9. 28,15,88,1.5,3점 - 😐 보통 (잎 끝이 살짝 말라 있거나 변화가 적음),없음,https://drive.google.com/open?id=1pBtcvZHd0FPgC0tpTRlJiA5N5vEosAKN
2026. 9. 14 오전 12:26:32,1313 서준혁,B-04 홍콩야자(준혁),2026. 9. 14,27.8,82,2.1,4점 - 🙂 양호 (특별한 이상 없이 잘 자라고 있음),특이사항 딱히없음. ,https://drive.google.com/open?id=1M8mVpUbEcqKYhr6aqUbG8IREsu0d-ibM
2026. 9. 21 오전 12:48:40,1313 서준혁,B-04 홍콩야자(준혁),2026. 9. 21,30,83,1.8,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),잎이 더 자람,https://drive.google.com/open?id=184EiJyZ292DVYV27r7nyhaBDQbkZF2a2
2026. 9. 27 오후 11:07:10,1313 서준혁,B-04 홍콩야자(준혁),2026. 9. 28,29.2,173,4.1,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),입이 더 자람,https://drive.google.com/open?id=1rAJu013jkBIzBq1ultgrRep2ZcZ6G-gH
2026. 9. 27 오후 11:02:43,1314 조성민,B-05 아글라오네마(붉)(성민),2026. 9. 28,22.5,11,15,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),없음,https://drive.google.com/open?id=1bmjUbP0D-O2Ir-qGwB87NU_-cW3M-nwB
2026. 9. 14 오전 12:27:17,3305 전수민,B-06 테이블야자(수민),2026. 9. 14,21.7,231,1.7,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),없음!,https://drive.google.com/open?id=1BO1jtxsc797sYljvBOyz27TRBGgSXbew
2026. 9. 14 오전 12:29:11,3305 전수민,B-07 안스리움(수민),2026. 9. 14,21,21,9.4,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),없음!,https://drive.google.com/open?id=1C07CzSRRFs_MLDrEMDc4OtQ1ySKzuR2_
2026. 9. 22 오후 8:47:28,1112 허승현,C-01 뱅갈고무나무(승현),2026. 9. 23,97,72,21,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),"새순이 8개 새로 돋아남,물주기 1주일에 3번,잎 마름:X,
해충:X",https://drive.google.com/open?id=1CUbhdG501lkvAil6u0BlX9_O1xkdm8wT
2026. 9. 27 오후 10:56:05,1112 허승현,C-01 뱅갈고무나무(승현),2026. 9. 28,97.2,90,21.1,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),새순이 4개 돋아남,https://drive.google.com/open?id=1O-f6GTDvodpysq0TUZrjEnfhjMhRGi34
2026. 9. 27 오후 11:03:10,1403 김동윤,C-02 안스리움(동윤),2026. 9. 28,23.5,20,8.5,4점 - 🙂 양호 (특별한 이상 없이 잘 자라고 있음),축축하다,https://drive.google.com/open?id=1IZCXRv7B2HZ59GRFr2RDIsMtLgpxAtA1
2026. 10. 6 오후 9:29:58,1118 최인찬,A-01 아글라오네마(흰)(인찬),2026. 10. 7,27,7,7.3,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),잎이 하나 더 생김,https://drive.google.com/open?id=18SnBlhmaCkUSzxNIA_4LyYbmyrnLxBSA
2026. 10. 6 오후 9:31:00,1213 성승민,A-02 죽백나무(승민),2026. 10. 7,13.5,71,1.9,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),잎이 새로 두개가 피어나고있다,https://drive.google.com/open?id=1h_4UQvCuLLl2fANZ4YSIiNnLXeS3ZNzQ
2026. 10. 6 오후 9:31:45,1314 조성민,A-05 아글라오네마(붉)(성민),2026. 10. 7,32,11,13,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),없음,https://drive.google.com/open?id=1h3uqUH0dZw-sMhFsWawXIQHXxZRe7FQR
2026. 10. 6 오후 9:33:04,1312 김호연,A-03 죽백나무(호연),2026. 10. 7,17.2,82,1.5,4점 - 🙂 양호 (특별한 이상 없이 잘 자라고 있음),잘 자라고 있음,https://drive.google.com/open?id=15CLhjBOohIpN0OhbyFt1qKtOL0Y5ZmyX
2026. 10. 6 오후 9:35:52,1213 성승민,B-02 죽백나무(승민),2026. 10. 7,15,72,1.8,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),없음,https://drive.google.com/open?id=1K1JXIBDA3-PSGp4UcU9juKbhNBZtk4NS
2026. 10. 6 오후 9:36:13,1112 허승현,C-01 뱅갈고무나무(승현),2026. 10. 7,100,115,21,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),새순 6개,https://drive.google.com/open?id=1Wf-i2B8B615IxxCKcnM0VSON-UKg_HKT
2026. 10. 6 오후 9:36:43,1403 김동윤,C-02 안스리움(동윤),2026. 10. 7,25,18,8.6,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),이상 없음,https://drive.google.com/open?id=1szyGYx4ooLHuCcSXqZiFpt28NZ6CQ6Io
2026. 10. 6 오후 9:37:49,1118 최인찬,B-01 아글라오네마(흰)(인찬),2026. 10. 7,31.2,11,6.7,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),잎이 하나 더 생김,https://drive.google.com/open?id=1KrJdxgesIylvnjws4yycV7snB4SDcMdJ
2026. 10. 6 오후 9:38:36,1312 김호연,B-03 죽백나무(호연),2026. 10. 7,19.5,86,1.2,3점 - 😐 보통 (잎 끝이 살짝 말라 있거나 변화가 적음),살짝 썩어있음,https://drive.google.com/open?id=1HbgzSm_nyBlzKqE6zolMRaX_OJRP9OGO
2026. 10. 7 오전 12:34:47,1313 서준혁,A-04 홍콩야자(준혁),2026. 10. 7,29.3,187,1.5,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),잎의 너비가 넓어지고 잎이 더 자람,https://drive.google.com/open?id=1E03P38QyaKZBfTCa4YwXxBhkUxIHVc-l
2026. 10. 7 오전 12:35:56,1313 서준혁,B-04 홍콩야자(준혁),2026. 10. 7,30.6,185,1.4,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),높이가 더 높아짐,https://drive.google.com/open?id=1u57U3XekB1UhxvfU8p3EXW29J9b0m8hR
2026. 10. 15 오후 9:35:27,1112 허승현,C-01 뱅갈고무나무(승현),2026. 10. 16,100,105,21,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),물이 부족해서 성장이 뚜렷하게 안보임,https://drive.google.com/open?id=1n1niS8-vMU4wIHlFlO_3lOZgmDQOH50O
2026. 10. 15 오후 9:36:16,1312 김호연,B-03 죽백나무(호연),2026. 10. 16,18.7,92,1.2,4점 - 🙂 양호 (특별한 이상 없이 잘 자라고 있음),없음,https://drive.google.com/open?id=10TcqJ4F_jrUlzrj0rlk4VdnrHkOIzy8J
2026. 10. 15 오후 9:36:59,1313 서준혁,B-04 홍콩야자(준혁),2026. 10. 16,31.6,195,1.2,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),잎의 길이가 길어지고 잎이 저 자람,https://drive.google.com/open?id=1Ny_qJuT4T4cY6zJte5jJwPsaKg_PPngv
2026. 10. 15 오후 9:39:47,1403 김동윤,C-02 안스리움(동윤),2026. 10. 16,25.7,21,8.2,3점 - 😐 보통 (잎 끝이 살짝 말라 있거나 변화가 적음),잎이 2~3개정도 살짝 말라있다.,https://drive.google.com/open?id=12Q9nTiKIZvZXnwolUKmiv2qMWKjAtdiB
2026. 10. 15 오후 9:42:11,1213 성승민,B-02 죽백나무(승민),2026. 10. 16,13.5,71,1.6,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),잎이 두개 더 핌,https://drive.google.com/open?id=1taeXYiYnFFA40rOWkSXCddvPx4jB0IiG
2026. 10. 15 오후 9:44:21,1314 조성민,A-05 아글라오네마(붉)(성민),2026. 10. 16,32,11,12.5,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),없음,https://drive.google.com/open?id=1gbyFbHd9SrC_XbVkxXMQYsqV1E6XbawI
2026. 10. 15 오후 9:44:39,1118 최인찬,B-01 아글라오네마(흰)(인찬),2026. 10. 16,31,10,6.6,4점 - 🙂 양호 (특별한 이상 없이 잘 자라고 있음),없음,https://drive.google.com/open?id=1I9NJo5ldyj_0DsPDrEFCpBqEIg66gTmC
2026. 10. 15 오후 9:45:15,1313 서준혁,A-04 홍콩야자(준혁),2026. 10. 16,30.4,198,1,5점 - 🌟 매우 양호 (새순이 돋거나 잎이 매우 싱싱함),잎의 개수가 늘어나고 길이가 길어짐,https://drive.google.com/open?id=1Ya2You94pBCdf9lYu6cbWxTdMnJnUj_Y
2026. 10. 15 오후 9:45:18,1312 김호연,A-03 죽백나무(호연),2026. 10. 16,15.5,73,1.8,4점 - 🙂 양호 (특별한 이상 없이 잘 자라고 있음),없음,https://drive.google.com/open?id=1cTAJSOxK-L-qm79DOE_NqHB_mZIPN5jD
2026. 10. 15 오후 9:50:17,1118 최인찬,A-01 아글라오네마(흰)(인찬),2026. 10. 16,24.8,7,7.3,3점 - 😐 보통 (잎 끝이 살짝 말라 있거나 변화가 적음),잎 끝이 노랗게 변해서 물을 줌,https://drive.google.com/open?id=1pP8NjIRQM0vaQ2IUjA-TIpJTKzOSZAUQ
2026. 10. 15 오후 9:50:50,1213 성승민,A-02 죽백나무(승민),2026. 10. 16,13.8,78,1.6,4점 - 🙂 양호 (특별한 이상 없이 잘 자라고 있음),잎이 하나 피어남,https://drive.google.com/open?id=1qgvZV_7H2nSB54lVAkoxzydImGALqhBS`;

// Robust CSV Parser that handles multiline fields and quotes
export function parseCSVData(csvText: string): ObservationRecord[] {
  const records: ObservationRecord[] = [];
  
  // Custom CSV parser handling newlines inside quotes
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuote = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentCell += '"';
        i++; // skip next quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length <= 1) return records;

  // Header is row 0
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (row.length < 8) continue;

    const timestamp = row[0] || '';
    const rawStudent = row[1] || '';
    const rawPlant = row[2] || '';
    const date = row[3] || '';
    const height = parseFloat(row[4]) || 0;
    const leafCount = parseInt(row[5], 10) || 0;
    const leafWidth = parseFloat(row[6]) || 0;
    const healthText = row[7] || '';
    const notes = row[8] || '없음';
    const photoUrl = row[9] || '';

    const studentId = cleanStudentId(rawStudent);
    const { plantId, cleanName, species, location } = cleanPlantName(rawPlant);
    const healthScore = parseHealthScore(healthText);
    const dateTimestamp = parseDateToTimestamp(date);
    const driveFileId = extractDriveFileId(photoUrl);

    records.push({
      id: `${plantId}-${date}-${rowIndex}`,
      timestamp,
      studentId,
      plantId,
      plantDisplayName: cleanName,
      species,
      location,
      date,
      dateTimestamp,
      height,
      leafCount,
      leafWidth,
      healthScore,
      healthText,
      notes,
      photoUrl,
      driveFileId,
    });
  }

  // Sort chronologically
  records.sort((a, b) => a.dateTimestamp - b.dateTimestamp);

  return records;
}

// Group records into distinct Plants
export function buildPlantList(records: ObservationRecord[]): Plant[] {
  const map = new Map<string, ObservationRecord[]>();

  for (const record of records) {
    if (!map.has(record.plantId)) {
      map.set(record.plantId, []);
    }
    map.get(record.plantId)!.push(record);
  }

  const plants: Plant[] = [];

  for (const [plantId, plantRecords] of map.entries()) {
    // Sort records by date
    plantRecords.sort((a, b) => a.dateTimestamp - b.dateTimestamp);

    const first = plantRecords[0];
    const latest = plantRecords[plantRecords.length - 1];

    plants.push({
      plantId,
      cleanName: first.plantDisplayName,
      species: first.species,
      location: first.location,
      studentId: first.studentId,
      records: plantRecords,
      initialHeight: first.height,
      latestHeight: latest.height,
      heightGrowth: Number((latest.height - first.height).toFixed(2)),
      initialLeafCount: first.leafCount,
      latestLeafCount: latest.leafCount,
      leafGrowth: latest.leafCount - first.leafCount,
      latestHealthScore: latest.healthScore,
      latestObservationDate: latest.date,
    });
  }

  // Natural sort by ID: A-01, A-02, ..., B-01, ..., C-01
  return plants.sort((a, b) => a.plantId.localeCompare(b.plantId, undefined, { numeric: true }));
}

// Species Knowledgebase
export const SPECIES_INFO_MAP: Record<string, SpeciesInfo> = {
  '아글라오네마(흰)': {
    name: '아글라오네마(흰)',
    scientificName: 'Aglaonema modestum / commutatum',
    englishName: 'Chinese Evergreen (Silver/White)',
    family: '천남성과 (Araceae)',
    origin: '동남아시아 열대 우림',
    sunlight: '반음지 ~ 밝은 간접광 (직사광선에 잎이 탈 수 있음)',
    watering: '겉흙이 마르면 듬뿍 (과습에 주의)',
    temperature: '20℃ ~ 26℃ (최저 13℃ 이상 유지 권장)',
    humidity: '50% ~ 70% (공중 분무 선호)',
    characteristics: [
      '은백색과 짙은 녹색의 화려한 잎 무늬가 돋보이는 대표적인 실내 관엽식물',
      '빛이 부족한 실내 환경에서도 탁월한 적응력을 보임',
      '수형이 단정하며 새잎이 줄기 중앙에서 돌돌 말려 올라옴',
      '미항공우주국(NASA) 선정 공기정화 식물로 벤젠, 포름알데히드 제거 우수',
    ],
    careTips: [
      '추위에 약하므로 겨울철 창가 찬바람을 피해주세요.',
      '잎 끝이 노랗게 변할 때는 과습이나 통풍 부족 여부를 점검하세요.',
      '주기적으로 젖은 수건으로 잎 표면의 먼지를 닦아주면 광합성에 큰 도움이 됩니다.',
    ],
    airPurification: '벤젠, 포름알데히드, 미세먼지 정화 효과 우수 ★★★★☆',
    imageEmoji: '🌿',
    colorTheme: 'emerald',
  },
  '아글라오네마(붉)': {
    name: '아글라오네마(붉)',
    scientificName: 'Aglaonema rotundum / Siam Aurora',
    englishName: 'Red Chinese Evergreen (Siam Red)',
    family: '천남성과 (Araceae)',
    origin: '태국, 인도네시아 등 동남아시아',
    sunlight: '은은한 간접광 (붉은 발색 유지를 위해 충분한 간접광 필요)',
    watering: '속흙 3~4cm가 말랐을 때 흠뻑 공급',
    temperature: '18℃ ~ 28℃ (따뜻하고 포근한 실내)',
    humidity: '60% 내외 (건조한 계절에는 잎 주변 분무 권장)',
    characteristics: [
      '잎 가장자리와 잎맥을 따라 번지는 강렬하고 우아한 붉은 핑크빛 발색',
      '화려한 색감으로 실내 인테리어 포인트 및 관상 가치가 매우 높음',
      '성장 속도는 완만하며 새 잎이 나올 때 붉은 색이 점차 짙어짐',
      '음이온 발생량이 풍부하여 전자파 차단과 집중력 향상에 기여',
    ],
    careTips: [
      '빛이 너무 부족하면 붉은 잎의 색이 옅어지고 초록색으로 변할 수 있습니다.',
      '화분 받침에 고인 물은 뿌리 부패를 일으킬 수 있으니 즉시 비워주세요.',
      '뿌리가 꽉 찼을 때는 1~2년에 한 번 배수가 좋은 흙으로 분갈이합니다.',
    ],
    airPurification: '실내 화학물질 정화 및 음이온 방출 효과 ★★★★☆',
    imageEmoji: '🌺',
    colorTheme: 'rose',
  },
  '죽백나무': {
    name: '죽백나무',
    scientificName: 'Nageia nagi (Thunb.) Kuntze',
    englishName: 'Broadleaf Podocarpus / Asian Bayberry',
    family: '나한송과 (Podocarpaceae)',
    origin: '한국(제주), 일본, 대만, 중국 남부',
    sunlight: '양지 ~ 반음지 (적응력이 매우 뛰어남)',
    watering: '겉흙이 마르면 충분히 관수 (배수 불량 시 뿌리 썩음 주의)',
    temperature: '15℃ ~ 25℃ (내한성이 비교적 강하나 5℃ 이상 유지 권장)',
    humidity: '40% ~ 60% (통풍이 매우 중요)',
    characteristics: [
      '대나무처럼 곧고 푸른 잎과 소나무처럼 단단한 기품을 가진 침엽 관엽수',
      '동양에서는 소원을 이루어주고 부귀와 건강을 부르는 길상목으로 사랑받음',
      '가지가 촘촘하게 뻗으며 수많은 작은 잎들이 싱그럽게 번성함',
      '피톤치드 발생량이 높아 실내 살균 및 피로 회복 효과가 탁월함',
    ],
    careTips: [
      '잎에 검은 반점이 생기거나 썩을 때는 통풍 부족 또는 흙의 과습이 주원인입니다.',
      '창문을 자주 열어 시원한 공기가 순환되도록 환기에 신경 써주세요.',
      '물을 줄 때는 흙 전체에 골고루 스며들도록 천천히 줍니다.',
    ],
    airPurification: '피톤치드 방출, 실내 살균 및 삼림욕 효과 ★★★★★',
    imageEmoji: '🌲',
    colorTheme: 'teal',
  },
  '홍콩야자': {
    name: '홍콩야자',
    scientificName: 'Schefflera arboricola',
    englishName: 'Dwarf Umbrella Tree',
    family: '두릅나무과 (Araliaceae)',
    origin: '대만, 중국 하이난 섬',
    sunlight: '밝은 간접광 ~ 반양지 (빛이 좋을수록 잎이 무성해짐)',
    watering: '흙 표면이 마르면 듬뿍, 겨울철에는 물주기 횟수 단축',
    temperature: '18℃ ~ 26℃ (최저 10℃ 이상 권장)',
    humidity: '50% ~ 70% (건조에도 비교적 잘 견딤)',
    characteristics: [
      '7~9장의 작은 타원형 잎이 마치 작은 우산 모양처럼 펼쳐지는 귀여운 수형',
      '생명력이 매우 강하고 새순이 쉴 새 없이 돋아나 관찰 재미가 큰 식물',
      '가지치기(적심)를 통해 풍성한 가지와 잎을 쉽게 유도할 수 있음',
      '담배 연기, 포름알데히드 등 유해 기체 흡수 능력이 월등하여 교실에 최적',
    ],
    careTips: [
      '성장 속도가 빨라 줄기가 길게 뻗으면 지지대를 세워 곧게 유도하세요.',
      '갑자기 잎이 우수수 떨어지는 현상은 급격한 환경 변화나 냉해 때문입니다.',
      '잎 장수가 급격히 늘어날 때는 충분한 수분과 간접 햇빛을 제공하세요.',
    ],
    airPurification: '담배 연기, 일산화탄소, 포름알데히드 흡수 1위급 ★★★★★',
    imageEmoji: '🌴',
    colorTheme: 'green',
  },
  '테이블야자': {
    name: '테이블야자',
    scientificName: 'Chamaedorea elegans',
    englishName: 'Parlour Palm / Neanthe Bella Palm',
    family: '야자과 (Arecaceae)',
    origin: '멕시코, 과테말라 열대 밀림',
    sunlight: '반음지 ~ 음지 (직사광선 절대 금지, 실내 형광등만으로도 생육 가능)',
    watering: '흙이 마른 후 1~2일 뒤 흠뻑 (건조에 강하고 과습에 민감)',
    temperature: '18℃ ~ 24℃ (최저 10℃ 이상 유지)',
    humidity: '50% ~ 70% (실내 건조 시 잎끝 갈변 방지를 위한 분무 추천)',
    characteristics: [
      '책상이나 테이블 위에 올려놓기 좋은 아담하고 우아한 소형 야자나무',
      '깃털처럼 섬세하게 갈라진 잎이 부드러운 열대 정원의 분위기를 연출',
      '수분 방출량이 풍부하여 실내 천연 가습기 역할을 훌륭히 수행',
      '병충해에 강하고 조도 요구량이 낮아 초보자도 쉽게 키울 수 있는 스테디셀러',
    ],
    careTips: [
      '직사광선에 노출되면 잎이 누렇게 타고 회복이 어려우니 반드시 그늘진 곳에 두세요.',
      '수돗물 속 염소 성분에 민감하므로 하루 전 받아둔 물을 주면 좋습니다.',
      '갈색으로 변한 오래된 잎은 밑동에서 가위로 잘라 새잎에 영양을 모아주세요.',
    ],
    airPurification: '천연 가습, 화학물질 흡착 및 실내 공기 정화 ★★★★★',
    imageEmoji: '🎍',
    colorTheme: 'lime',
  },
  '안스리움': {
    name: '안스리움',
    scientificName: 'Anthurium andraeanum',
    englishName: 'Flamingo Flower / Painter’s Palette',
    family: '천남성과 (Araceae)',
    origin: '콜롬비아, 에콰도르 열대 우림',
    sunlight: '밝은 간접광 (빛이 충분해야 꽃대가 계속해서 올라옴)',
    watering: '흙 겉면이 마르면 흠뻑, 화분 밑으로 물이 빠져나오게 관수',
    temperature: '20℃ ~ 28℃ (추위에 취약, 15℃ 이상 필수)',
    humidity: '70% 이상의 고온 다습 환경 선호',
    characteristics: [
      '하트 모양의 반짝이는 진녹색 잎과 붉은빛의 화려한 불염포(꽃덮개)',
      '꽃처럼 보이는 붉은 판은 잎이 변형된 포엽이며, 가운데 막대 모양이 진짜 꽃',
      '한 번 피어난 불염포는 몇 달 동안 지속될 정도로 개화 기간이 긺',
      '실내 암모니아, 일산화탄소, 톨루엔 등 주방 및 화장실 냄새 정화 탁월',
    ],
    careTips: [
      '흙이 너무 오래 축축하면 뿌리가 숨을 쉬지 못하니 통기성 좋은 바크나 펄라이트를 섞어주세요.',
      '꽃대를 오래 감상하려면 직사광선은 피하되 창가의 밝은 산란광을 쬐어줍니다.',
      '실내 습도가 낮으면 잎 끝이 마를 수 있으니 공중 습도를 높여주세요.',
    ],
    airPurification: '암모니아, 톨루엔, 크실렌 제거 특화 ★★★★★',
    imageEmoji: '❤️',
    colorTheme: 'red',
  },
  '뱅갈고무나무': {
    name: '뱅갈고무나무',
    scientificName: 'Ficus benghalensis',
    englishName: 'Banyan Fig / Bengal Fig',
    family: '뽕나무과 (Moraceae)',
    origin: '인도, 방글라데시 (인도의 국목)',
    sunlight: '양지 ~ 밝은 간접광 (빛을 아주 좋아하는 대표 양지식물)',
    watering: '속흙까지 거의 말랐을 때 화분 밑으로 흐르도록 듬뿍 (주 1~2회)',
    temperature: '20℃ ~ 30℃ (고온 선호, 최저 13℃ 이상 유지)',
    humidity: '50% ~ 60% (환기가 잘 되는 환경 필수)',
    characteristics: [
      '단단하고 고풍스러운 목대와 둥글고 밝은 연두빛 잎맥이 매력적인 대형 관엽수',
      '새순이 고깔 모양의 붉은 껍질을 뚫고 나오며 돋아나는 과정이 역동적임',
      '키가 1m 이상 시원하게 뻗으며 수많은 큰 잎이 무성하게 자라남',
      '미세먼지 흡착 능력이 탁월하고 음이온을 다량 배출하는 숲의 나무',
    ],
    careTips: [
      '물이 부족하면 큰 잎들이 아래로 처지고 성장이 정체됩니다.',
      '빛이 부족하면 잎의 노란색 무늬가 사라지고 짙은 초록색으로 둔화될 수 있습니다.',
      '물을 준 뒤에는 받침에 물이 고이지 않도록 하고 충분히 바람을 쐬어주세요.',
    ],
    airPurification: '미세먼지 흡착, 초미세먼지 제거 및 음이온 방출 1위 ★★★★★',
    imageEmoji: '🌳',
    colorTheme: 'amber',
  },
};

// Location Environment Details
export const LOCATION_DETAILS = {
  A: {
    code: 'A' as const,
    name: '위치 A 구역',
    subTitle: '플랜트월 조명 & 실내 간접광 구역 (학생 이동 많은 통행로)',
    description: '플랜트월의 조명과 형광등을 통해 간접광을 활용하며 환기는 보통 정도입니다. 학생 이동이 많은 교내 통행로에 위치해 있습니다.',
    // User specification: A relies on plantwall dedicated light + school fluorescent lamps (indirect light)
    sunlightLevel: '플랜트월 전용 조명 + 교내 형광등',
    sunlightSummary: '전용 조명 + 형광등 (자연 채광 없음 · 실내 간접광)',
    hasDedicatedLight: true,
    hasFluorescentLight: true,
    naturalLightLevel: '없음 (실내 통행로)',
    ventilation: '보통 정도 (실내 통행로 공기 순환)',
    tempStability: '안정적 (20℃ ~ 24℃)',
    crowd: '학생 이동이 많은 곳 (주요 통행로)',
    photo: locAPhoto,
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-300',
    pastelCard: 'bg-[#eaf8f2] border-[#ceeedf] text-emerald-800',
  },
  B: {
    code: 'B' as const,
    name: '위치 B 구역',
    subTitle: '창문 인접 & 개방 공간 (우수한 환기 · 약한 자연광)',
    description: '바로 옆에 창문이 있고 주변에 탁 트인 공간이 있어 A공간에 비해 상대적으로 환기가 잘 되는 위치입니다. (B와 C 공간은 바로 옆에 위치하여 환기 정도가 동일함)',
    // User specification: B의 채광은 플랜트월 전용 조명 + 교내 형광등 + 자연 채광 약하게 들어오고
    sunlightLevel: '플랜트월 전용 조명 + 교내 형광등 + 자연 채광 약하게 들어옴',
    sunlightSummary: '전용 조명 + 형광등 + 약한 자연 채광 (측면 대형 창문)',
    hasDedicatedLight: true,
    hasFluorescentLight: true,
    naturalLightLevel: '약하게 들어옴 (측면 창문 인접)',
    ventilation: '매우 우수 (창문 인접 및 개방 공간, 바로 옆 C구역과 환기 정도 동일)',
    tempStability: '외기 환기 영향 (19℃ ~ 25℃)',
    crowd: '보통 (휴게 및 자습 개방 공간)',
    photo: locBPhoto,
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200 ring-1 ring-blue-300',
    pastelCard: 'bg-[#eaf4fe] border-[#cde4fb] text-blue-800',
  },
  C: {
    code: 'C' as const,
    name: '위치 C 구역',
    subTitle: '천창 직하 & B구역 바로 옆 (동일한 우수 환기 · 천창 자연 채광)',
    description: 'B공간 바로 옆에 위치하여 환기 정도는 B와 동일하게 상대적으로 잘 되며, 특히 천창이 가까이에 있어 낮에는 태양광이 잘 들어오는 장소입니다.',
    // User specification: C는 교내 형광등 + 천창의 유리창을 통한 자연 채광
    sunlightLevel: '교내 형광등 + 천창의 유리창을 통한 자연 채광',
    sunlightSummary: '형광등 + 천창 유리창 자연 채광 (플랜트월 조명 없음 · 풍부한 직사 태양광)',
    hasDedicatedLight: false,
    hasFluorescentLight: true,
    naturalLightLevel: '풍부함 (천창 스카이라이트 직하)',
    ventilation: '매우 우수 (B구역 바로 옆에 위치하여 환기 정도 동일)',
    tempStability: '낮 시간대 온난 (20℃ ~ 27℃)',
    crowd: '보통 (2층 복도/아트리움 플랜터 화단)',
    photo: locCPhoto,
    color: 'purple',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200 ring-1 ring-purple-300',
    pastelCard: 'bg-[#edeffb] border-[#dadff8] text-purple-800',
  },
};

export const INITIAL_RECORDS = parseCSVData(RAW_CSV_DATA);
export const INITIAL_PLANTS = buildPlantList(INITIAL_RECORDS);

